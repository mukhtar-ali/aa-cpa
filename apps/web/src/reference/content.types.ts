import type {
  ActionRef,
  ArticleSummary,
  EstimatorLabels,
  EstimatorQuestion,
  ImageRef,
  LogoItem,
  Pillar,
  ProcessStep,
  ServiceSummary,
  SiteChrome,
  Stat,
  Testimonial,
} from '@repo/design-system/types';

/** Mock content for the design-system reference homepage (`/<lang>/reference/home`). Typed with the library's view models. */
export interface HomeContent {
  meta: { title: string };
  chrome: SiteChrome;
  /** Accessible names that are not part of SiteChrome. */
  labels: { menu: string; closeMenu: string; mainNav: string; socials: string; services: string; news: string };
  hero: { title: string; body: string; actions: ActionRef[]; image: ImageRef };
  gap: { statement: string; eyebrow: string; body: string; images: [ImageRef, ImageRef] };
  marquee: { label: string; pauseLabel: string; rows: LogoItem[][] };
  services: { eyebrow: string; title: string; items: ServiceSummary[] };
  reasons: { title: string; description: string; pillars: Pillar[]; image: ImageRef; action: ActionRef; stats: Stat[] };
  credentials: { title: string; description: string; logos: LogoItem[]; placeholderLabel: string };
  process: { eyebrow: string; title: string; description: string; steps: ProcessStep[] };
  quote: { title: string; body: string; action: ActionRef; image: ImageRef };
  news: { eyebrow: string; title: string; readMore: string; allLabel: string; articles: ArticleSummary[] };
  estimator: {
    heading: string;
    intro: string;
    cardTitle: string;
    cardIntro: string;
    labels: EstimatorLabels;
    questions: EstimatorQuestion[];
    quote: { label: string; fields: { name: string; mobile: string; email: string; consent: string }; submitLabel: string; successMessage: string };
    testimonial: Testimonial;
    ratingLabel: string;
  };
  whatsapp: { href: string; label: string };
}
