import type { EventContent } from "../../types";
import { sharedEn } from "./shared.en";

export const event1En: EventContent<"en"> = {
  id: 1,
  slug: "1",
  date: "2025-12-13",
  primaryLanguage: "pt-br",
  schedule: sharedEn.schedules["br"],
  translations: {
      "en": {
        "title": "AI Boost Day #1",
        "subtitle": "It will be an intense day where you'll learn a robust process, orchestrated by a senior programmer and a generative AI, to turn your problem into a real, scalable solution in record time.",
        "summary": "In this event you'll see in practice how to use an AI to write a solution far better and faster than you could on your own.",
        "location": "In-person in Brasilia or online (via videoconference)",
        "heroCtaLabel": "Secure my spot",
        "secondaryCtaLabel": "See how it works"
      }
    },
  sections: {
    intro: sharedEn.intro,
    howItWorks: sharedEn.howItWorks,
    plans: sharedEn.plans,
  },
};

export default event1En;
