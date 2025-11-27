import type { SharedContent } from "../types";

export const sharedPt: SharedContent<"pt"> = {
  schedules: {
    br: {
      timezoneCountry: "br",
      timezoneId: "America/Sao_Paulo",
      periods: [
        {
          start: "08:30",
          end: "12:30",
          label: { pt: "Manhã:" },
        },
        {
          start: "13:30",
          end: "17:30",
          label: { pt: "Tarde:" },
        },
      ],
    },
    pt: {
      timezoneCountry: "pt",
      timezoneId: "Europe/Lisbon",
      periods: [
        {
          start: "09:00",
          end: "13:00",
          label: { pt: "Manhã:" },
        },
        {
          start: "14:00",
          end: "18:00",
          label: { pt: "Tarde:" },
        },
      ],
    },
  },
  intro: {
    pt: {
      title: "Antes do evento: seus passos",
      items: [
        'Use o {AIBoostBot} para baixar *GRATUITAMENTE* o documento "Arquitetura de Referência".',
        "Inscreva-se. {EscolhaOPlanoIdealParaVoce}.",
        "Elabore o seu projeto. Use o {AIBoostBot} para avaliar se ele se enquadra na arquiteutra.",
        "Submeta o seu projeto para que ele participe do proceso de votação.",
        "Avalie os outros projetos submetidos para participar da votação na manhã do evento.",
      ],
    },
  },
  howItWorks: {
    pt: [
      {
        title: "Manhã: votação e construção do projeto",
        items: [
          "Votação no projeto que será desenvolvido nesta edição.",
          "Revisão, clara e objetiva, dos problemas que tentaremos solutionar no projeto.",
          "Implementação e testes através de prompts para a IA e da revisão humana.",
        ],
      },
      {
        title: "Tarde: dissecação, aprendizado e próximos passos",
        items: [
          "Análise crítica da solução construída pela IA + humano.",
          "Discussão de alternativas e ferramentas.",
          "Roadmap e próximos passos para o projeto.",
          "Espaço para perguntas abertas sobre IA aplicada ao dia a dia.",
          "Registro dos aprendizados principais da edição.",
        ],
      },
    ],
  },
  plans: {
    pt: {
      primary: [
        {
          name: "Plano Bronze",
          price: "R$ X",
          note: "Acesso apenas a este evento",
          cta: "Escolher Bronze",
          button: "outline",
          features: [
            "Participação ao vivo neste AI Boost Day.",
            "Acesso à gravação por tempo limitado.",
            "Material base apresentado durante o dia.",
          ],
        },
        {
          name: "Plano Prata",
          price: "R$ Y",
          note: "Ideal para quem quer aprender com outras edições",
          cta: "Escolher Prata",
          button: "primary",
          badge: "Mais escolhido",
          features: [
            "Tudo do Bronze.",
            "Acesso ao material produzido em ocorrências passadas.",
            "Acesso às gravações anteriores enquanto o plano estiver ativo.",
            "Entrada em comunidade privada de participantes.",
          ],
        },
        {
          name: "Plano Ouro",
          price: "R$ Z",
          note: "Pensado para quem quer acompanhar várias edições",
          cta: "Escolher Ouro",
          button: "outline",
          features: [
            "Tudo do Prata.",
            "Acesso a esta edição + mais duas futuras.",
            "Prioridade na seleção de problemas para votação.",
          ],
        },
      ],
      diamond: [
        {
          name: "Plano Diamante",
          price: "R$ W",
          note: "Para quem quer acompanhamento próximo e direção estratégica",
          cta: "Escolher Diamante",
          button: "outline",
          features: [
            "Tudo do Plano Ouro.",
            "+ 2 horas de mentoria individual com agenda combinada.",
            "Discussão de arquitetura, roadmap ou estratégia de produto.",
          ],
        },
      ],
    },
  },
};

export default sharedPt;
