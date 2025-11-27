import type { EventContent } from "../types";
import { sharedPt } from "./shared.pt";

export const event2Pt: EventContent<"pt"> = {
  id: 2,
  slug: "2",
  date: "2026-01-10",
  primaryLanguage: "pt-br",
  schedule: sharedPt.schedules.pt,
  translations: {
    pt: {
      title: "AI Boost Day #2",
      subtitle:
        "Será um dia intenso no qual você aprenderá um processo robusto, orquestrado por um programador sênior e uma IA generativa, para tornar seu problema em uma solução real e escalável em tempo recorde.",
      summary:
        "Neste evento você verá na prática como usar uma IA para escrever uma solução muito melhor e mais rápida do que você seria capaz.",
      location: "Online (via videoconferência)",
      heroCtaLabel: "Garantir minha vaga",
      secondaryCtaLabel: "Ver como funciona",
    },
  },
  sections: {
    intro: sharedPt.intro,
    howItWorks: sharedPt.howItWorks,
    plans: sharedPt.plans,
  },
};

export default event2Pt;
