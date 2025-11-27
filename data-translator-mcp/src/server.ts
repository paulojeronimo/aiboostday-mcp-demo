import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const packageRoot = path.resolve(__dirname, "..");
const projectRoot = path.resolve(
  process.env.AIBOOSTDAY_ROOT ?? path.join(packageRoot, "..")
);
const dataDir = path.resolve(
  process.env.AIBOOSTDAY_DATA ?? path.join(projectRoot, "data")
);
const generatorScript = path.join(dataDir, "generate.sh");
const eventsJsonPath = path.join(dataDir, "events", "generated", "events.json");

type GeneratorOptions = {
  input?: string;
};

const schedulePeriodSchema = z.object({
  start: z.string(),
  end: z.string(),
  label: z.string(),
});

const scheduleSchema = z.object({
  timezoneCountry: z.string(),
  timezoneId: z.string(),
  periods: z.array(schedulePeriodSchema),
});

const introSchema = z.object({
  title: z.string(),
  items: z.array(z.string()),
});

const howItWorksEntrySchema = z.object({
  title: z.string(),
  items: z.array(z.string()),
});

const planSchema = z.object({
  name: z.string(),
  price: z.string(),
  note: z.string(),
  cta: z.string(),
  button: z.string(),
  badge: z.string().optional(),
  features: z.array(z.string()),
});

const plansSchema = z.object({
  primary: z.array(planSchema),
  diamond: z.array(planSchema),
});

const sectionsSchema = z.object({
  intro: introSchema,
  howItWorks: z.array(howItWorksEntrySchema),
  plans: plansSchema,
});

const translationSchema = z.object({
  shared: z.object({
    schedules: z.record(scheduleSchema),
    intro: introSchema,
    howItWorks: z.array(howItWorksEntrySchema),
    plans: plansSchema,
  }),
  events: z.array(
    z.object({
      slug: z.string(),
      translations: z.object({
        title: z.string(),
        subtitle: z.string(),
        summary: z.string(),
        location: z.string(),
        heroCtaLabel: z.string(),
        secondaryCtaLabel: z.string(),
      }),
      sections: sectionsSchema.optional(),
    })
  ),
});

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function runGeneratorCommand(
  args: string[],
  options?: GeneratorOptions
): Promise<string> {
  if (!fs.existsSync(generatorScript)) {
    throw new Error(`Missing generator script at ${generatorScript}`);
  }
  return new Promise((resolve, reject) => {
    const child = spawn(generatorScript, args, {
      cwd: projectRoot,
      env: {
        ...process.env,
        DATA_GENERATOR_ROOT: projectRoot,
        DATA_GENERATOR_DATA_DIR: dataDir,
      },
    });
    let stdout = "";
    let stderr = "";
    if (options?.input) {
      child.stdin.write(options.input);
    }
    child.stdin.end();
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => reject(error));
    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        const message =
          stderr.trim() || stdout.trim() || `Generator exited with ${code ?? 0}`;
        reject(new Error(message));
      }
    });
  });
}

async function loadPortugueseDataset(): Promise<unknown> {
  const output = await runGeneratorCommand(["dump"]);
  return JSON.parse(output);
}

async function writeTranslations(payload: string): Promise<string> {
  let normalized: unknown;
  try {
    normalized = JSON.parse(payload);
  } catch (error) {
    throw new Error("Translation payload must be valid JSON");
  }
  const parsed = translationSchema.safeParse(normalized);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "payload"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid translation payload: ${message}`);
  }

  const data = parsed.data;
  const sharedSections = {
    intro: data.shared.intro,
    howItWorks: data.shared.howItWorks,
    plans: data.shared.plans,
  };

  // If an event's sections match shared, drop them so the generator reuses shared references.
  for (const event of data.events) {
    if (event.sections && deepEqual(event.sections, sharedSections)) {
      delete event.sections;
    }
  }

  const serialized = JSON.stringify(data, null, 2);
  await runGeneratorCommand(["translate"], { input: serialized });
  return "English data regenerated in data/events/generated/.";
}

async function buildFinalDataset(outputPath?: string): Promise<{
  message: string;
  data: unknown;
  path: string;
}> {
  const args = ["build"];
  let resolvedPath = eventsJsonPath;
  if (outputPath) {
    resolvedPath = path.resolve(projectRoot, outputPath);
    args.push("--output", resolvedPath);
  }
  const message = await runGeneratorCommand(args);
  const data = JSON.parse(fs.readFileSync(resolvedPath, "utf-8"));
  return { message, data, path: resolvedPath };
}

const server = new McpServer({
  name: "data-translator-mcp",
  version: "0.1.0",
});

server.registerTool(
  "prepare_translations",
  {
    title: "Prepare translations",
    description:
      "Dump the Portuguese dataset and instructions so you can produce the English JSON payload.",
    inputSchema: z.object({}),
  },
  async (_args, _extra) => {
    const dataset = await loadPortugueseDataset();
    const instructions = [
      "Translate every Portuguese string to English.",
      "Return JSON with the structure { shared: {...}, events: [...] } matching the Portuguese data.",
      "Do not nest Portuguese keys (pt) inside the English payload; every field under shared/events must contain the already translated English string.",
      "Keep numeric values, slugs, IDs, and schedule periods unchanged.",
    ].join(" ");
    const datasetText = JSON.stringify(dataset, null, 2);
    return {
      content: [
        { type: "text" as const, text: instructions },
        { type: "text" as const, text: datasetText },
      ],
      structuredContent: { instructions, dataset },
    };
  }
);

server.registerTool(
  "apply_translations",
  {
    title: "Apply translations",
    description:
      "Write the translated English data into data/events/generated/ based on the provided JSON.",
    inputSchema: {
      payload: z.string(),
    },
  },
  async ({ payload }, _extra) => {
    const message = await writeTranslations(payload);
    return {
      content: [{ type: "text" as const, text: message }],
      structuredContent: { message },
    };
  }
);

server.registerTool(
  "build_dataset",
  {
    title: "Build dataset",
    description:
      "Merge Portuguese originals with the generated English files and emit the JSON consumed by the backend.",
    inputSchema: {
      outputPath: z.string().optional(),
    },
  },
  async ({ outputPath }, _extra) => {
    const result = await buildFinalDataset(outputPath);
    const datasetText = JSON.stringify(result.data, null, 2);
    return {
      content: [
        { type: "text" as const, text: result.message },
        { type: "text" as const, text: datasetText },
      ],
      structuredContent: result,
    };
  }
);

async function start() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
