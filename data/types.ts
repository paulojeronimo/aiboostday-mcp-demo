export type LanguageCode = "pt" | "en";

export type LocalizedRecord<T, L extends LanguageCode> = Record<L, T>;

export type SchedulePeriod<L extends LanguageCode> = {
  start: string;
  end: string;
  label: LocalizedRecord<string, L>;
};

export type Schedule<L extends LanguageCode> = {
  timezoneCountry: string;
  timezoneId: string;
  periods: SchedulePeriod<L>[];
};

export type IntroCard = {
  title: string;
  items: string[];
};

export type HowItWorksEntry = {
  title: string;
  items: string[];
};

export type Plan = {
  name: string;
  price: string;
  note: string;
  cta: string;
  button: string;
  badge?: string;
  features: string[];
};

export type PlanSet = {
  primary: Plan[];
  diamond: Plan[];
};

export type EventTranslation = {
  title: string;
  subtitle: string;
  summary: string;
  location: string;
  heroCtaLabel: string;
  secondaryCtaLabel: string;
};

export type Sections<L extends LanguageCode> = {
  intro: LocalizedRecord<IntroCard, L>;
  howItWorks: LocalizedRecord<HowItWorksEntry[], L>;
  plans: LocalizedRecord<PlanSet, L>;
};

export type EventContent<L extends LanguageCode> = {
  id: number;
  slug: string;
  date: string;
  primaryLanguage: string;
  schedule: Schedule<L>;
  translations: LocalizedRecord<EventTranslation, L>;
  sections: Sections<L>;
};

export type SharedContent<L extends LanguageCode> = {
  schedules: Record<string, Schedule<L>>;
  intro: LocalizedRecord<IntroCard, L>;
  howItWorks: LocalizedRecord<HowItWorksEntry[], L>;
  plans: LocalizedRecord<PlanSet, L>;
};

export type EventBundle = EventContent<"pt"> & {
  schedule: Schedule<LanguageCode>;
  translations: LocalizedRecord<EventTranslation, LanguageCode>;
  sections: Sections<LanguageCode>;
};
