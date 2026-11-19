/**
 * UI view models for `@repo/design-system`
 * Derived from specs/001-design-system/data-model.md
 */

export type Href = string;
export type Locale = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';
export type IsoDate = string; // e.g. '2026-10-12'

export interface ImageRef {
  src: string;
  alt: string;
  width: number;
  height: number;
  decorative?: boolean;
  blurDataURL?: string;
}

export interface LinkRef {
  label: string;
  href: Href;
  external?: boolean;
}

export interface ActionRef extends LinkRef {
  variant?: 'primary' | 'secondary' | 'outline-light' | 'link';
}

export interface NavItem {
  label: string;
  href: Href;
  active?: boolean;
  children?: NavItem[];
}

export type SocialNetwork = 'linkedin' | 'x' | 'instagram' | 'whatsapp';

export interface SocialLink {
  network: SocialNetwork;
  href: Href;
  label: string;
}

export interface FooterColumn {
  title: string;
  links: LinkRef[];
}

export interface ContactChannel {
  type: 'phone' | 'email' | 'whatsapp' | 'hours';
  label: string;
  value: string;
  href?: Href;
}

export interface Office {
  city: string;
  address: string;
  mapHref?: Href;
  mapLabel?: string;
  image?: ImageRef;
  isHeadquarters?: boolean;
  coordinates?: { x: number; y: number };
}

export interface Stat {
  value: number | string;
  prefix?: string;
  suffix?: string;
  label: string;
}

export interface ServiceSummary {
  id: string;
  title: string;
  summary: string;
  image?: ImageRef;
  href?: Href;
  ctaLabel?: string;
  highlight?: { label: string; value: string; note?: string };
}

export interface Pillar {
  icon: string;
  title: string;
  body: string;
}

export interface ProcessStep {
  index: number;
  title: string;
  body: string;
}

export interface MethodologyRow {
  title: string;
  body: string;
}

export interface SectorSummary {
  id: string;
  title: string;
  summary: string;
  href?: Href;
}

export interface CaseStory {
  title: string;
  sector: string;
  service?: string;
  image: ImageRef;
  href: Href;
  ctaLabel: string;
}

export interface Author {
  name: string;
  role?: string;
  avatar?: ImageRef;
  bio?: string;
}

export interface ArticleSummary {
  id: string;
  title: string;
  category: string;
  date: IsoDate;
  readingMinutes?: number;
  image: ImageRef;
  href: Href;
  excerpt?: string;
  author?: Author;
}

export interface TocItem {
  id: string;
  label: string;
  index?: number;
}

export interface JobSummary {
  id: string;
  title: string;
  department: string;
  city: string;
  contract: string;
  experience?: string;
  postedAt?: IsoDate;
  closesAt?: IsoDate;
  href: Href;
}

export interface Perk {
  icon?: string;
  title: string;
  body: string;
}

export interface Testimonial {
  quote: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  name: string;
  role: string;
  company?: string;
  avatar?: ImageRef;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface LogoItem {
  name: string;
  image?: ImageRef;
  href?: Href;
  placeholder?: boolean;
}

export interface LegalSection {
  id: string;
  title: string;
  html: string;
}

export interface LegalDocument {
  updatedAt: IsoDate;
  summary: string[];
  sections: LegalSection[];
  downloadHref?: Href;
}

export interface EstimatorQuestion {
  id: string;
  prompt: string;
  hint?: string;
  kind: 'currency' | 'number' | 'choice';
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  placeholder?: string;
}

export interface EstimatorLabels {
  progress: string; // e.g. "السؤال {n} من {total}"
  next: string;
  back: string;
  start: string;
  result: string;
  disclaimer: string;
  restart: string;
}

export interface EstimatorQuoteConfig {
  label: string;
  fields: {
    name: string;
    mobile: string;
    email: string;
    consent: string;
  };
  submitLabel: string;
  successMessage: string;
  onSubmit(
    data: { name: string; mobile: string; email: string; consent: boolean },
    answers: Record<string, string | number>,
    range: { min: number; max: number },
  ): Promise<void>;
}

export interface EstimatorConfig {
  questions: EstimatorQuestion[];
  labels: EstimatorLabels;
  currency: 'SAR';
  estimate: (answers: Record<string, string | number>) => Promise<{ min: number; max: number }>;
  quote?: EstimatorQuoteConfig;
}

export interface FormFieldModel {
  name: string;
  label: string;
  required?: boolean;
  help?: string;
  error?: string;
  disabled?: boolean;
}

export interface FileUploadModel extends FormFieldModel {
  accept: string[];
  maxBytes: number;
  value?: File | { name: string; size: number };
}

export interface SiteChrome {
  logo: { href: Href; label: string };
  utility: {
    license: string;
    network: string;
    city: string;
    phone: ContactChannel;
  };
  nav: NavItem[];
  cta: ActionRef;
  localeSwitch: { current: Locale; label: string; href: Href };
  footer: {
    description: string;
    socials: SocialLink[];
    columns: FooterColumn[];
    contacts: ContactChannel[];
    legal: {
      copyright: string;
      registry: string[];
      links: LinkRef[];
    };
    backToTopLabel: string;
    wordmark: string;
  };
}
