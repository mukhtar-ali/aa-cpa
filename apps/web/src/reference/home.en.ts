import type { HomeContent } from './content.types';

const img = (name: string, w: number, h: number) => ({ src: `/reference/${name}.svg`, alt: '', width: w, height: h, decorative: true });

/** Provisional English mock content (to be approved by the client); mirrors the structure of the Arabic content. */
export const homeEn: HomeContent = {
  meta: { title: 'Home · Design system reference' },
  chrome: {
    logo: { href: '#', label: 'Abdulrahman Al-Shabibshiri Professional Consulting' },
    utility: {
      license: 'SOCPA licence No. 522',
      network: 'Independent member of the 3E Accounting global network (80+ countries)',
      city: 'Riyadh · Qassim',
      phone: { type: 'phone', label: 'Phone', value: '+966 55 534 6560' },
    },
    nav: [
      { label: 'Home', href: '#', active: true },
      { label: 'About us', href: '#' },
      { label: 'Services', href: '#' },
      { label: 'Sectors', href: '#' },
      { label: 'Articles', href: '#' },
      { label: 'Contact', href: '#' },
    ],
    cta: { label: 'Request a quote', href: '#' },
    localeSwitch: { current: 'en', label: 'عربي', href: '/ar/reference/home' },
    footer: {
      description: 'Partner-led audit, backed by AI precision. SOCPA licence No. 522, member of the 3E Accounting global network.',
      socials: [
        { network: 'linkedin', href: '#', label: 'LinkedIn' },
        { network: 'x', href: '#', label: 'X' },
        { network: 'instagram', href: '#', label: 'Instagram' },
      ],
      columns: [
        { title: 'Quick links', links: ['Home', 'About us', 'Services', 'Sectors', 'Articles', 'Contact'].map((label) => ({ label, href: '#' })) },
        { title: 'Services', links: ['External audit', 'Professional consulting', 'Local content review', 'Tax services'].map((label) => ({ label, href: '#' })) },
        { title: 'Our offices', links: ['Riyadh', 'Khobar', 'Qassim'].map((label) => ({ label, href: '#' })) },
      ],
      contacts: [
        { type: 'phone', label: 'Phone', value: '+966 55 534 6560' },
        { type: 'email', label: 'Email', value: 'info@aacpa.sa' },
      ],
      legal: {
        copyright: '© 2026 Abdulrahman Al-Shabibshiri Professional Consulting. Licence No. 522. Member of 3E Accounting.',
        registry: ['CR: 1010469357', 'VAT: 310456789200003'],
        links: [{ label: 'Privacy policy', href: '#' }],
      },
      backToTopLabel: 'Back to top',
      wordmark: 'ALSHABIBSHIRI',
    },
  },
  labels: { menu: 'Menu', closeMenu: 'Close menu', mainNav: 'Main navigation', socials: 'Social media', services: 'Services', news: 'News' },
  hero: {
    title: 'Partner-led audit, backed by AI precision.',
    body: 'We combine partners licensed by the Saudi Organization for Chartered and Professional Accountants (SOCPA) with smart audit technology, giving you big-firm precision at the speed of a direct local partner: real results in weeks, not months.',
    actions: [
      { label: 'Learn more', href: '#' },
      { label: 'Our services', href: '#' },
    ],
    image: img('hero', 630, 498),
  },
  gap: {
    statement: 'Mid-sized companies deserve what the big firms get: a partner who knows your name, an opinion signed on time, and standards that do not bend.',
    eyebrow: 'The gap we fill',
    body: 'Most companies reach a stage where the local accountant can no longer sign what the bank asks for, and a global firm means high fees, a waiting list of months and a junior team you never meet. We were founded to close exactly that gap: a licensed partner, direct contact, and technology that speeds the work up instead of leaving you in a queue.',
    images: [img('gap-small', 220, 181), img('gap-tall', 315, 415)],
  },
  marquee: {
    label: 'Our clients',
    pauseLabel: 'Pause logo animation',
    rows: [0, 1].map((r) => Array.from({ length: 6 }, (_, i) => ({ name: `Client ${r * 6 + i + 1}`, image: { src: i % 2 ? '/reference/logo-3e.svg' : '/reference/logo-socpa.svg', alt: `Client ${r * 6 + i + 1}`, width: 124, height: 80 } }))),
  },
  services: {
    eyebrow: 'Why AA-CPA',
    title: 'Audit and compliance for a smarter Saudi economy',
    items: [
      { id: 'consulting', title: 'Professional consulting', summary: 'Audit reports ready for banks and boards, reviewed directly by a licensed partner, not a changing junior team.', image: img('service-consulting', 557, 470), href: '#', ctaLabel: 'Request a quote', highlight: { label: 'Average response time to your enquiry', value: '24 hours', note: 'Straight from a licensed partner, not a receptionist.' } },
      { id: 'audit', title: 'External audit', summary: 'Independent audits to SOCPA standards, signed by a partner who knows your business.', image: img('service-audit', 557, 470), href: '#', ctaLabel: 'Request a quote' },
      { id: 'local-content', title: 'Local content review', summary: 'Local content certificates signed by a partner who knows the authorities’ requirements and answers your questions directly.' },
      { id: 'tax', title: 'Tax services', summary: 'Zakat and tax returns filed accurately and on time, with direct partner follow-up.' },
    ],
  },
  reasons: {
    title: 'Why do companies move to us?',
    description: 'The person who reviews your work is the same person who answers your questions. No layers in between.',
    pillars: [
      { icon: 'scan', title: 'Technology that shortens the work, not the judgement.', body: 'Our analytics find deviations faster than manual sampling, so partner time goes to thinking, not counting.' },
      { icon: 'hexagon-dot', title: 'Licensed partners who sign by name', body: 'Every file is supervised by a SOCPA-licensed partner who stays in touch with you until handover.' },
      { icon: 'globe-check', title: 'Part of a global network', body: 'Independent member of 3E Accounting in more than 80 countries, for clients whose business crosses borders.' },
    ],
    image: img('reasons', 461, 542),
    action: { label: 'Request a quote', href: '#' },
    stats: [
      { value: 522, label: 'Our SOCPA licence number' },
      { value: 4, suffix: 'weeks', label: 'Average review turnaround' },
      { value: 120, prefix: '+', label: 'Clients in 8 sectors' },
      { value: 10, suffix: 'years', label: 'Of professional practice' },
    ],
  },
  credentials: {
    title: 'Accredited by',
    description: 'We work under the licences and accreditations of official bodies and memberships of international professional networks.',
    logos: [
      { name: 'SOCPA', image: { src: '/reference/logo-socpa.svg', alt: 'Saudi Organization for Chartered and Professional Accountants', width: 124, height: 80 } },
      { name: '3E Accounting', image: { src: '/reference/logo-3e.svg', alt: '3E Accounting', width: 153, height: 40 } },
      { name: 'placeholder-3', placeholder: true },
      { name: 'placeholder-4', placeholder: true },
      { name: 'placeholder-5', placeholder: true },
    ],
    placeholderLabel: 'Organisation logo',
  },
  process: {
    eyebrow: 'How we work',
    title: 'From the first call to a report a partner signs',
    description: 'A clear four-step path with dates announced from the start, so you never have to chase anyone to find out where your file is.',
    steps: [
      { index: 1, title: 'Intro call', body: 'We understand your business, the scope of work and the deadlines you owe your bank or regulator.' },
      { index: 2, title: 'Quote within 7 working days', body: 'A written quote with scope, fees and timeline, with no hidden items.' },
      { index: 3, title: 'Partner-led fieldwork', body: 'A licensed partner supervises the team, and analytics tools flag deviations early.' },
      { index: 4, title: 'Signed report and handover', body: 'A report ready for banks and boards, with follow-up after delivery for any question.' },
    ],
  },
  quote: {
    title: 'One partner, from the first file\nto the signed report.',
    body: 'No middleman between you and the person who signs. They read your file, discuss it with you and sign it themselves.',
    action: { label: 'Request a quote', href: '#' },
    image: img('quote', 720, 640),
  },
  news: {
    eyebrow: 'News',
    title: 'News and articles that matter to your business',
    readMore: 'Read more',
    allLabel: 'View all news',
    articles: [1, 2, 3, 4].map((n) => ({ id: `n${n}`, title: 'How AI is changing the work of an auditor', category: 'Articles', date: '2026-10-12', image: img(`news-${n}`, 267, 250), href: '#' })),
  },
  estimator: {
    heading: 'Not ready to talk yet? Get a number in 60 seconds',
    intro: 'Answer four questions for an indicative estimate, with no commitment.',
    cardTitle: 'Not ready to talk yet? Get a number in 60 seconds',
    cardIntro: 'Answer four questions for an indicative estimate.',
    labels: { progress: 'Question {n} of {total}', next: 'Next', back: 'Back', start: 'Start estimate', result: 'Your estimated range', disclaimer: 'The result is an estimate only and not a commitment.', restart: 'Start over', invalid: 'Enter a valid answer', error: 'Something went wrong, please try again' },
    questions: [
      { id: 'revenue', prompt: 'Approximate annual revenue (SAR)', kind: 'currency', min: 1, placeholder: '12,000,000' },
      { id: 'staff', prompt: 'Number of employees', kind: 'number', min: 1, max: 10000 },
      { id: 'sector', prompt: 'Sector', kind: 'choice', options: [{ value: 'retail', label: 'Retail' }, { value: 'industry', label: 'Industry' }, { value: 'services', label: 'Services' }] },
      { id: 'deadline', prompt: 'Required deadline', kind: 'choice', options: [{ value: 'soon', label: 'Within a month' }, { value: 'later', label: 'Later' }] },
    ],
    quote: { label: 'Request a formal quote', fields: { name: 'Full name', mobile: 'Mobile number', email: 'Email', consent: 'I agree to be contacted' }, submitLabel: 'Send request', successMessage: 'Thank you, we will contact you soon.' },
    testimonial: { quote: 'A partner who knows our name and delivers a signed report on time, with no layers in between and no surprises.', rating: 5, name: 'Omar Al-Salem', role: 'Chief Financial Officer', company: 'Sample Contracting Co.', avatar: { src: '/reference/avatar.svg', alt: 'Omar Al-Salem', width: 56, height: 56, decorative: true } },
    ratingLabel: '5 of 5',
  },
  whatsapp: { href: 'https://wa.me/966555346560', label: 'WhatsApp' },
};
