#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import type {
  EventContent,
  EventTranslation,
  HowItWorksEntry,
  IntroCard,
  LanguageCode,
  PlanSet,
  Sections,
  SharedContent,
} from "./types";

type PortugueseBundle = {
  shared: SharedContent<"pt">;
  events: EventContent<"pt">[];
};

type EnglishBundle = {
  shared: SharedContent<"en">;
  events: EventContent<"en">[];
};

type SharedTranslationInput = {
  schedules: Record<
    string,
    {
      timezoneCountry: string;
      timezoneId: string;
      periods: Array<{ start: string; end: string; label: string }>;
    }
  >;
  intro: IntroCard;
  howItWorks: HowItWorksEntry[];
  plans: PlanSet;
};

type EventSectionsTranslation = Partial<{
  intro: IntroCard;
  howItWorks: HowItWorksEntry[];
  plans: PlanSet;
}>;

type EventTranslationInput = {
  slug: string;
  translations: EventTranslation;
  sections?: EventSectionsTranslation;
};

type TranslationBundle = {
  shared: SharedTranslationInput;
  events: EventTranslationInput[];
};

type ArgMap = Record<string, string | boolean>;

const DATA_DIR = path.resolve(
  process.env.DATA_GENERATOR_DATA_DIR ?? __dirname
);
const ROOT_DIR = path.resolve(
  process.env.DATA_GENERATOR_ROOT ?? path.join(DATA_DIR, "..")
);
const EVENTS_DIR = path.join(DATA_DIR, "events");
const ORIGINALS_DIR = EVENTS_DIR;
const GENERATED_DIR = path.join(EVENTS_DIR, "generated");
const OUTPUT_JSON = path.join(EVENTS_DIR, "generated", "events.json");
const TS_CONFIG_RELATIVE = path.join("data", "tsconfig.json");

function parseArgs(argv: string[]): ArgMap {
  const args: ArgMap = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token.startsWith("--")) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        args[key] = next;
        i += 1;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

function runTsc(outDir: string): void {
  const result = spawnSync(
    "npx",
    [
      "--prefix",
      "data",
      "tsc",
      "-p",
      TS_CONFIG_RELATIVE,
      "--outDir",
      outDir,
      "--rootDir",
      "data",
    ],
    { cwd: ROOT_DIR, stdio: "inherit" }
  );
  if (result.status !== 0) {
    throw new Error("TypeScript compilation failed");
  }
}

function withCompiledData<T>(fn: (buildDir: string) => T): T {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "events-build-"));
  try {
    runTsc(tmpDir);
    return fn(tmpDir);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

function loadModule<T>(buildDir: string, relativeTsPath: string): T {
  const compiledPath = relativeTsPath.replace(/\.ts$/, ".js");
  const modulePath = path.join(buildDir, compiledPath);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const loaded = require(modulePath);
  if (loaded && "default" in loaded) {
    return loaded.default as T;
  }
  const values = Object.values(loaded);
  if (values.length === 1) {
    return values[0] as T;
  }
  throw new Error(`Unable to load module at ${modulePath}`);
}

function loadPortugueseBundle(buildDir: string): PortugueseBundle {
  const shared = loadModule<SharedContent<"pt">>(
    buildDir,
    "events/shared.pt.ts"
  );
  const events: EventContent<"pt">[] = [];
  for (const file of fs.readdirSync(ORIGINALS_DIR)) {
    if (!file.endsWith(".pt.ts") || !file.startsWith("event_")) {
      continue;
    }
    const event = loadModule<EventContent<"pt">>(
      buildDir,
      path.join("events", file)
    );
    events.push(event);
  }
  events.sort((a, b) => a.id - b.id);
  return { shared, events };
}

function loadEnglishBundle(buildDir: string): EnglishBundle {
  const shared = loadModule<SharedContent<"en">>(
    buildDir,
    "events/generated/shared.en.ts"
  );
  const events: EventContent<"en">[] = [];
  for (const file of fs.readdirSync(GENERATED_DIR)) {
    if (!file.endsWith(".en.ts") || !file.startsWith("event_")) {
      continue;
    }
    const event = loadModule<EventContent<"en">>(
      buildDir,
      path.join("events", "generated", file)
    );
    events.push(event);
  }
  events.sort((a, b) => a.id - b.id);
  return { shared, events };
}

function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

function resetDir(dirPath: string): void {
  fs.rmSync(dirPath, { recursive: true, force: true });
  ensureDir(dirPath);
}

function formatObject(value: unknown, indentLevel: number): string {
  const pad = "  ".repeat(indentLevel);
  return JSON.stringify(value, null, 2).replace(/\n/g, `\n${pad}`);
}

function sanitizeSlug(slug: string): string {
  return slug.replace(/[^A-Za-z0-9_-]/g, "-");
}

function findScheduleKey(
  schedule: SharedContent<"pt">["schedules"][string],
  schedules: SharedContent<"pt">["schedules"]
): string {
  for (const key of Object.keys(schedules)) {
    const candidate = schedules[key];
    if (
      candidate.timezoneCountry === schedule.timezoneCountry &&
      candidate.timezoneId === schedule.timezoneId &&
      candidate.periods.length === schedule.periods.length
    ) {
      const mismatch = candidate.periods.some((period, index) => {
        const target = schedule.periods[index];
        return (
          period.start !== target.start ||
          period.end !== target.end ||
          period.label.pt !== target.label.pt
        );
      });
      if (!mismatch) {
        return key;
      }
    }
  }
  throw new Error("Unable to match event schedule to shared schedule");
}

function buildSharedEnglish(
  sharedPt: SharedContent<"pt">,
  translation: SharedTranslationInput
): SharedContent<"en"> {
  const schedules: SharedContent<"en">["schedules"] = {};
  for (const key of Object.keys(sharedPt.schedules)) {
    const source = sharedPt.schedules[key];
    const translated = translation.schedules[key];
    if (!translated) {
      throw new Error(`Missing translated schedule for key "${key}"`);
    }
    if (source.periods.length !== translated.periods.length) {
      throw new Error(`Schedule "${key}" period count mismatch`);
    }
    schedules[key] = {
      timezoneCountry: source.timezoneCountry,
      timezoneId: source.timezoneId,
      periods: source.periods.map((period, index) => {
        const translatedPeriod = translated.periods[index];
        if (
          period.start !== translatedPeriod.start ||
          period.end !== translatedPeriod.end
        ) {
          throw new Error(`Schedule "${key}" periods must match exactly`);
        }
        return {
          start: period.start,
          end: period.end,
          label: { en: translatedPeriod.label },
        };
      }),
    };
  }
  return {
    schedules,
    intro: { en: translation.intro },
    howItWorks: { en: translation.howItWorks },
    plans: { en: translation.plans },
  };
}

function renderSharedModule(shared: SharedContent<"en">): string {
  const body = JSON.stringify(shared, null, 2);
  return `import type { SharedContent } from "../../types";

export const sharedEn: SharedContent<"en"> = ${body};

export default sharedEn;
`;
}

function renderEventModule(
  event: EventContent<"pt">,
  translation: EventTranslationInput,
  scheduleKey: string
): string {
  const constName = `event${event.id}En`;
  const translationsLiteral = formatObject(
    { en: translation.translations },
    2
  );
  const introLiteral = translation.sections?.intro
    ? formatObject({ en: translation.sections.intro }, 3)
    : "sharedEn.intro";
  const howItWorksLiteral = translation.sections?.howItWorks
    ? formatObject({ en: translation.sections.howItWorks }, 3)
    : "sharedEn.howItWorks";
  const plansLiteral = translation.sections?.plans
    ? formatObject({ en: translation.sections.plans }, 3)
    : "sharedEn.plans";
  return `import type { EventContent } from "../../types";
import { sharedEn } from "./shared.en";

export const ${constName}: EventContent<"en"> = {
  id: ${event.id},
  slug: ${JSON.stringify(event.slug)},
  date: ${JSON.stringify(event.date)},
  primaryLanguage: ${JSON.stringify(event.primaryLanguage)},
  schedule: sharedEn.schedules[${JSON.stringify(scheduleKey)}],
  translations: ${translationsLiteral},
  sections: {
    intro: ${introLiteral},
    howItWorks: ${howItWorksLiteral},
    plans: ${plansLiteral},
  },
};

export default ${constName};
`;
}

function writeGeneratedFile(relativePath: string, content: string): void {
  const generatedPath = path.join(GENERATED_DIR, relativePath);
  ensureDir(path.dirname(generatedPath));
  fs.writeFileSync(generatedPath, content, { encoding: "utf-8" });
}

function translateCommand(args: ArgMap): void {
  const inputPath = typeof args.input === "string" ? args.input : undefined;
  const inputData = inputPath
    ? fs.readFileSync(path.resolve(inputPath), "utf-8")
    : fs.readFileSync(0, "utf-8");
  if (!inputData.trim()) {
    throw new Error("Translation input is empty");
  }
  const translation = JSON.parse(inputData) as TranslationBundle;
  if (!translation.shared || !Array.isArray(translation.events)) {
    throw new Error("Invalid translation payload");
  }
  withCompiledData((buildDir) => {
    const portuguese = loadPortugueseBundle(buildDir);
    const sharedEn = buildSharedEnglish(portuguese.shared, translation.shared);
    resetDir(GENERATED_DIR);
    writeGeneratedFile("shared.en.ts", renderSharedModule(sharedEn));
    const translationsMap = new Map<string, EventTranslationInput>();
    for (const entry of translation.events) {
      translationsMap.set(entry.slug, entry);
    }
    for (const event of portuguese.events) {
      const translatedEvent = translationsMap.get(event.slug);
      if (!translatedEvent) {
        throw new Error(`Missing translation for event slug "${event.slug}"`);
      }
      const scheduleKey = findScheduleKey(
        event.schedule,
        portuguese.shared.schedules
      );
      const fileName = `event_${sanitizeSlug(event.slug)}.en.ts`;
      const fileContent = renderEventModule(
        event,
        translatedEvent,
        scheduleKey
      );
      writeGeneratedFile(fileName, fileContent);
    }
  });
  process.stdout.write("Translated files generated for review.\n");
}

function mergeSchedules(
  pt: SharedContent<"pt">["schedules"][string],
  en: SharedContent<"en">["schedules"][string]
): SharedContent<LanguageCode>["schedules"][string] {
  if (
    pt.timezoneCountry !== en.timezoneCountry ||
    pt.timezoneId !== en.timezoneId
  ) {
    throw new Error("Schedule timezone mismatch");
  }
  if (pt.periods.length !== en.periods.length) {
    throw new Error("Schedule period count mismatch");
  }
  return {
    timezoneCountry: pt.timezoneCountry,
    timezoneId: pt.timezoneId,
    periods: pt.periods.map((period, index) => {
      const translated = en.periods[index];
      if (period.start !== translated.start || period.end !== translated.end) {
        throw new Error("Schedule periods must match start/end times");
      }
      return {
        start: period.start,
        end: period.end,
        label: {
          pt: period.label.pt,
          en: translated.label.en,
        },
      };
    }),
  };
}

function mergeSections(
  pt: Sections<"pt">,
  en: Sections<"en">
): Sections<LanguageCode> {
  return {
    intro: {
      pt: pt.intro.pt,
      en: en.intro.en,
    },
    howItWorks: {
      pt: pt.howItWorks.pt,
      en: en.howItWorks.en,
    },
    plans: {
      pt: pt.plans.pt,
      en: en.plans.en,
    },
  };
}

function mergeEvents(
  ptBundle: PortugueseBundle,
  enBundle: EnglishBundle
): EventContent<LanguageCode>[] {
  const englishBySlug = new Map<string, EventContent<"en">>();
  for (const event of enBundle.events) {
    englishBySlug.set(event.slug, event);
  }
  return ptBundle.events.map((event) => {
    const translated = englishBySlug.get(event.slug);
    if (!translated) {
      throw new Error(`Missing English event for slug "${event.slug}"`);
    }
    const scheduleKey = findScheduleKey(
      event.schedule,
      ptBundle.shared.schedules
    );
    const mergedSchedule = mergeSchedules(
      event.schedule,
      enBundle.shared.schedules[scheduleKey]
    );
    return {
      id: event.id,
      slug: event.slug,
      date: event.date,
      primaryLanguage: event.primaryLanguage,
      schedule: mergedSchedule,
      translations: {
        pt: event.translations.pt,
        en: translated.translations.en,
      },
      sections: mergeSections(event.sections, translated.sections),
    };
  });
}

function buildCommand(args: ArgMap): void {
  const outputPath =
    typeof args.output === "string"
      ? path.resolve(args.output)
      : OUTPUT_JSON;
  const events = withCompiledData((buildDir) => {
    const portuguese = loadPortugueseBundle(buildDir);
    const english = loadEnglishBundle(buildDir);
    const merged = mergeEvents(portuguese, english);
    merged.sort((a, b) => a.id - b.id);
    return merged;
  });
  const payload = { events };
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2), {
    encoding: "utf-8",
  });
  process.stdout.write(`Final JSON written to ${outputPath}\n`);
}

function dumpCommand(args: ArgMap): void {
  const outputPath =
    typeof args.output === "string" ? path.resolve(args.output) : undefined;
  const data = withCompiledData((buildDir) => loadPortugueseBundle(buildDir));
  const payload = { shared: data.shared, events: data.events };
  const serialized = JSON.stringify(payload, null, 2);
  if (outputPath) {
    fs.writeFileSync(outputPath, serialized, { encoding: "utf-8" });
    process.stdout.write(`Portuguese dataset written to ${outputPath}\n`);
  } else {
    process.stdout.write(serialized);
    process.stdout.write("\n");
  }
}

function main(): void {
  const [, , command, ...rest] = process.argv;
  const args = parseArgs(rest);
  try {
    if (command === "translate") {
      translateCommand(args);
    } else if (command === "build") {
      buildCommand(args);
    } else if (command === "dump") {
      dumpCommand(args);
    } else {
      process.stderr.write(
        "Usage: node generate.ts [translate|build|dump] [--input file] [--output file]\n"
      );
      process.exit(1);
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    process.stderr.write(`Error: ${message}\n`);
    process.exit(1);
  }
}

main();
