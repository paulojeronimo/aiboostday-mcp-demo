import type { SharedContent } from "../../types";

export const sharedEn: SharedContent<"en"> = {
  "schedules": {
    "br": {
      "timezoneCountry": "br",
      "timezoneId": "America/Sao_Paulo",
      "periods": [
        {
          "start": "08:30",
          "end": "12:30",
          "label": {
            "en": "Morning:"
          }
        },
        {
          "start": "13:30",
          "end": "17:30",
          "label": {
            "en": "Afternoon:"
          }
        }
      ]
    },
    "pt": {
      "timezoneCountry": "pt",
      "timezoneId": "Europe/Lisbon",
      "periods": [
        {
          "start": "09:00",
          "end": "13:00",
          "label": {
            "en": "Morning:"
          }
        },
        {
          "start": "14:00",
          "end": "18:00",
          "label": {
            "en": "Afternoon:"
          }
        }
      ]
    }
  },
  "intro": {
    "en": {
      "title": "Before the event: your steps",
      "items": [
        "Use {AIBoostBot} to download the *FREE* \"Reference Architecture\" document.",
        "Sign up. {EscolhaOPlanoIdealParaVoce}.",
        "Draft your project. Use {AIBoostBot} to check if it fits the architecture.",
        "Submit your project so it joins the voting process.",
        "Review the other submitted projects to take part in the morning vote on the event day."
      ]
    }
  },
  "howItWorks": {
    "en": [
      {
        "title": "Morning: voting and building the project",
        "items": [
          "Vote on the project that will be built in this edition.",
          "Clear, objective review of the problems we'll try to solve in the project.",
          "Implementation and testing via prompts to the AI plus human review."
        ]
      },
      {
        "title": "Afternoon: dissection, learning, and next steps",
        "items": [
          "Critical analysis of the solution built by AI + human.",
          "Discussion of alternatives and tools.",
          "Roadmap and next steps for the project.",
          "Open Q&A on AI applied to everyday work.",
          "Recording the edition's key learnings."
        ]
      }
    ]
  },
  "plans": {
    "en": {
      "primary": [
        {
          "name": "Bronze Plan",
          "price": "R$ X",
          "note": "Access only to this event",
          "cta": "Choose Bronze",
          "button": "outline",
          "features": [
            "Live participation in this AI Boost Day.",
            "Access to the recording for a limited time.",
            "Core materials presented during the day."
          ]
        },
        {
          "name": "Silver Plan",
          "price": "R$ Y",
          "note": "Ideal for those who want to learn from other editions",
          "cta": "Choose Silver",
          "button": "primary",
          "badge": "Most chosen",
          "features": [
            "Everything in Bronze.",
            "Access to materials produced in past editions.",
            "Access to previous recordings while the plan stays active.",
            "Entry to a private participant community."
          ]
        },
        {
          "name": "Gold Plan",
          "price": "R$ Z",
          "note": "Designed for those who want to follow multiple editions",
          "cta": "Choose Gold",
          "button": "outline",
          "features": [
            "Everything in Silver.",
            "Access to this edition + two future ones.",
            "Priority in selecting problems for voting."
          ]
        }
      ],
      "diamond": [
        {
          "name": "Diamond Plan",
          "price": "R$ W",
          "note": "For those who want close guidance and strategic direction",
          "cta": "Choose Diamond",
          "button": "outline",
          "features": [
            "Everything in the Gold Plan.",
            "+ 2 hours of 1:1 mentoring with scheduled time.",
            "Discussion of architecture, roadmap, or product strategy."
          ]
        }
      ]
    }
  }
};

export default sharedEn;
