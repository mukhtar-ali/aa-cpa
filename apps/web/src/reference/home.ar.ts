import type { HomeContent } from './content.types';

const img = (name: string, w: number, h: number) => ({ src: `/reference/${name}.svg`, alt: '', width: w, height: h, decorative: true });

/** Arabic mock content copied from Figma 411:169 (placeholder photos). */
export const homeAr: HomeContent = {
  meta: { title: 'الرئيسية · مرجع النظام التصميمي' },
  chrome: {
    logo: { href: '#', label: 'شركة عبدالرحمن الشبيشيري للاستشارات المهنية' },
    utility: {
      license: 'ترخيص الهيئة السعودية للمراجعين والمحاسبين SOCPA رقم ٥٢٢',
      network: 'عضو مستقل في شبكة 3E Accounting العالمية (٨٠+ دولة)',
      city: 'الرياض · القصيم',
      phone: { type: 'phone', label: 'الهاتف', value: '+966 55 534 6560' },
    },
    nav: [
      { label: 'الرئيسية', href: '#', active: true },
      { label: 'من نحن', href: '#' },
      { label: 'خدماتنا', href: '#' },
      { label: 'القطاعات', href: '#' },
      { label: 'المقالات', href: '#' },
      { label: 'تواصل معنا', href: '#' },
    ],
    cta: { label: 'أطلب عرض سعر', href: '#' },
    localeSwitch: { current: 'ar', label: 'EN', href: '/en/reference/home' },
    footer: {
      description: 'مراجعة يقودها الشركاء، بدقة يدعمها الذكاء الاصطناعي. ترخيص SOCPA رقم 522، وعضو في شبكة 3E Accounting العالمية.',
      socials: [
        { network: 'linkedin', href: '#', label: 'لينكدإن' },
        { network: 'x', href: '#', label: 'إكس' },
        { network: 'instagram', href: '#', label: 'إنستغرام' },
      ],
      columns: [
        { title: 'روابط سريعة', links: ['الرئيسية', 'من نحن', 'خدماتنا', 'القطاعات', 'المقالات', 'تواصل معنا'].map((label) => ({ label, href: '#' })) },
        { title: 'خدماتنا', links: ['المراجعة الخارجية', 'الاستشارات المهنية', 'مراجعة المحتوى المحلي', 'الخدمات الضريبية'].map((label) => ({ label, href: '#' })) },
        { title: 'مكاتبنا', links: ['الرياض', 'الخبر', 'القصيم'].map((label) => ({ label, href: '#' })) },
      ],
      contacts: [
        { type: 'phone', label: 'الهاتف', value: '+966 55 534 6560' },
        { type: 'email', label: 'البريد الإلكتروني', value: 'info@aacpa.sa' },
      ],
      legal: {
        copyright: '© 2026 مكتب عبدالرحمن الشبيشيري للاستشارات المهنية. ترخيص رقم 522. عضو شبكة 3E Accounting.',
        registry: ['السجل التجاري: 1010469357', 'الرقم الضريبي: 310456789200003'],
        links: [{ label: 'سياسة الخصوصية', href: '#' }],
      },
      backToTopLabel: 'إلى الأعلى',
      wordmark: 'الشبيشيري',
    },
  },
  labels: { menu: 'القائمة', closeMenu: 'إغلاق القائمة', mainNav: 'التنقل الرئيسي', socials: 'وسائل التواصل الاجتماعي', services: 'الخدمات', news: 'الأخبار' },
  hero: {
    title: 'مراجعة يقودها الشركاء، بدقة يدعمها الذكاء الاصطناعي.',
    body: 'تجمع شركة عبدالرحمن الشبيشيري للاستشارات المهنية بين خبرة شركاء مرخّصين من الهيئة السعودية للمراجعين والمحاسبين القانونيين (SOCPA) وتقنيات مراجعة ذكية، لتقدّم لك دقة الشركات العالمية الكبرى، بسرعة شريك محلي مباشر نتائج حقيقية في أسابيع، لا أشهر.',
    actions: [
      { label: 'أعرف المزيد', href: '#' },
      { label: 'خدماتنا', href: '#' },
    ],
    image: img('hero', 630, 498),
  },
  gap: {
    statement: 'الشركات المتوسطة تستحق ما تحصل عليه الشركات الكبرى: شريكًا يعرف اسمك، ورأيًا موقّعًا في موعده، ومعايير لا تتنازل.',
    eyebrow: 'الفجوة التي نملؤها',
    body: 'تصل معظم المنشآت إلى مرحلة لم يعد فيها المحاسب المحلي قادرًا على اعتماد ما يطلبه البنك ويأتي عرض الشركات العالمية الكبرى بتكلفة مرتفعة، وقائمة انتظار تمتد لأشهر، وفريق مبتدئين لم يلتقِ بك يومًا. تأسست شركتنا لتغطية هذه الفجوة تحديدًا: اعتماد شريك مرخّص، وتواصل مباشر، وتقنية تجعل العمل أسرع بدلًا من أن تجعلك تنتظر في الطابور.',
    images: [img('gap-small', 220, 181), img('gap-tall', 315, 415)],
  },
  marquee: {
    label: 'عملاؤنا',
    pauseLabel: 'إيقاف حركة الشعارات',
    rows: [0, 1].map((r) => Array.from({ length: 6 }, (_, i) => ({ name: `عميل ${r * 6 + i + 1}`, image: { src: i % 2 ? '/reference/logo-3e.svg' : '/reference/logo-socpa.svg', alt: `عميل ${r * 6 + i + 1}`, width: 124, height: 80 } }))),
  },
  services: {
    eyebrow: 'لماذا شركة عبدالرحمن الشبيشيري',
    title: 'مراجعة وامتثال يواكبان اقتصادًا سعوديًا أكثر ذكاءً',
    headline: 'دقة الشركات العالمية الكبرى',
    headlineAccent: 'بسرعة شريك محلي مباشر',
    items: [
      { id: 'consulting', title: 'الاستشارات المهنية', summary: 'تقارير مراجعة جاهزة للبنوك ومجالس الإدارة، يراجعها شريك مرخّص مباشرة، لا فريق مبتدئين متغيّر.', image: img('service-consulting', 557, 470), href: '#', ctaLabel: 'الحصول علي عرض سعر', highlight: { label: 'متوسط زمن الرد على استفسارك', value: '24 ساعة', note: 'من شريك مرخّص مباشرةً، لا من موظف استقبال.' } },
      { id: 'audit', title: 'المراجعة الخارجية', summary: 'مراجعة مستقلة وفق معايير الهيئة السعودية للمراجعين والمحاسبين، بتوقيع شريك يعرف أعمالك.', image: img('service-audit', 557, 470), href: '#', ctaLabel: 'الحصول علي عرض سعر' },
      { id: 'local-content', title: 'مراجعة المحتوى المحلي', summary: 'شهادات المحتوى المحلي بتوقيع شريك يعرف اشتراطات الجهات ويجيب عن استفساراتك مباشرة.' },
      { id: 'tax', title: 'الخدمات الضريبية', summary: 'إقرارات الزكاة والضريبة بدقة وفي مواعيدها، مع متابعة مباشرة من الشريك.' },
    ],
  },
  reasons: {
    title: 'لماذا تنتقل المنشآت إلينا؟',
    description: 'الشخص الذي يراجع عملك هو نفسه من يجيبك عند أي استفسار. بلا طبقات وسيطة.',
    pillars: [
      { icon: 'globe-check', title: 'مرخّصون، وموصولون عالميًا.', body: 'رخصة SOCPA رقم 522، مع امتداد شبكة 3E Accounting العالمية حين تتجاوز أعمالك حدود المملكة.' },
      { icon: 'scan', title: 'تقنية تختصر العمل، لا الحكم المهني.', body: 'أدوات التحليل لدينا تكشف الانحرافات أسرع من العينات اليدوية، ليذهب وقت الشريك إلى التفكير لا إلى العدّ.' },
      { icon: 'location', title: 'عمق نادر في المحتوى المحلي.', body: 'نحن من الشركات القليلة المرخصة من SOCPA التي تمتلك خبرة متخصصة في تصديق المحتوى المحلي.' },
    ],
    image: img('reasons', 461, 542),
    action: { label: 'أطلب عرض سعر', href: '#' },
    stats: [
      { value: 522, label: 'رقم رخصتنا لدى SOCPA' },
      { value: 4, suffix: 'أسابيع', label: 'متوسط إنجاز المراجعة' },
      { value: 120, prefix: '+', label: 'عميلًا في 8 قطاعات' },
      { value: 10, suffix: 'سنوات', label: 'من الممارسة المهنية' },
    ],
  },
  credentials: {
    title: 'موثقون لدى',
    description: 'نعمل وفق تراخيص واعتمادات الجهات الرسمية، وعضوية شبكات مهنية دولية.',
    logos: [
      { name: 'SOCPA', image: { src: '/reference/logo-socpa.svg', alt: 'الهيئة السعودية للمراجعين والمحاسبين', width: 124, height: 80 } },
      { name: '3E Accounting', image: { src: '/reference/logo-3e.svg', alt: '3E Accounting', width: 153, height: 40 } },
      { name: 'placeholder-3', placeholder: true },
      { name: 'placeholder-4', placeholder: true },
      { name: 'placeholder-5', placeholder: true },
    ],
    placeholderLabel: 'شعار الجهة',
  },
  process: {
    eyebrow: 'كيف نعمل',
    title: 'من أول اتصال',
    accent: 'إلى تقرير يحمل توقيع شريك',
    description: 'مسار واضح من أربع خطوات، بمواعيد معلنة من البداية، دون أن تضطر إلى ملاحقة أحد لمعرفة أين وصل ملفك.',
    steps: [
      { index: 1, title: 'مكالمة تعريفية', body: 'نفهم نشاطك ونطاق العمل والمواعيد التي تلتزم بها أمام البنك أو الجهة الرقابية.' },
      { index: 2, title: 'عرض سعر خلال 7 أيام عمل', body: 'عرض مكتوب بالنطاق والأتعاب والجدول الزمني، دون بنود مخفية.' },
      { index: 3, title: 'عمل ميداني يقوده شريك', body: 'يشرف شريك مرخّص على الفريق، وتكشف أدوات التحليل الانحرافات مبكرًا.' },
      { index: 4, title: 'تقرير موقّع وتسليم', body: 'تقرير جاهز للبنوك ومجالس الإدارة، ومتابعة بعد التسليم لأي استفسار.' },
    ],
  },
  quote: {
    title: 'شريك واحد، من أول ملف\nحتى توقيع التقرير.',
    body: 'لا وسيط بينك وبين من يوقّع. يقرأ ملفك، ويناقشك فيه، ويوقّع عليه بنفسه.',
    action: { label: 'أطلب عرض سعر', href: '#' },
    image: img('quote', 720, 640),
  },
  news: {
    eyebrow: 'الأخبار',
    title: 'أخبار ومقالات تهمّ منشأتك',
    readMore: 'اقرأ المزيد',
    allLabel: 'عرض كل الأخبار',
    articles: [1, 2, 3, 4].map((n) => ({ id: `n${n}`, title: 'كيف يغيّر الذكاء الاصطناعي عمل مراجع الحسابات؟', category: 'مقالات', date: '2026-10-12', image: img(`news-${n}`, 267, 250), href: '#' })),
  },
  estimator: {
    heading: 'لست مستعدًا للحديث بعد؟ احصل على رقم خلال 60 ثانية',
    intro: 'أجب عن أربعة أسئلة لتحصل على تقدير استرشادي، دون أي التزام.',
    cardTitle: 'لست مستعدًا للحديث بعد؟ احصل على رقم خلال 60 ثانية',
    cardIntro: 'أجب عن أربعة أسئلة لتحصل على تقدير استرشادي.',
    labels: { progress: 'السؤال {n} من {total}', next: 'التالي', back: 'رجوع', start: 'ابدأ التقدير', result: 'التقدير الاسترشادي', disclaimer: 'النتيجة تقديرية فقط ولا تُعد التزامًا.', restart: 'ابدأ من جديد', invalid: 'أدخل إجابة صحيحة', error: 'حدث خطأ، يرجى المحاولة مرة أخرى' },
    questions: [
      { id: 'revenue', prompt: 'الإيرادات السنوية التقريبية (ريال)', kind: 'currency', min: 1, placeholder: '12,000,000' },
      { id: 'staff', prompt: 'عدد الموظفين', kind: 'number', min: 1, max: 10000 },
      { id: 'sector', prompt: 'القطاع', kind: 'choice', options: [{ value: 'retail', label: 'التجزئة' }, { value: 'industry', label: 'الصناعة' }, { value: 'services', label: 'الخدمات' }] },
      { id: 'deadline', prompt: 'الموعد المطلوب', kind: 'choice', options: [{ value: 'soon', label: 'خلال شهر' }, { value: 'later', label: 'لاحقًا' }] },
    ],
    quote: { label: 'اطلب عرض سعر رسميًا', fields: { name: 'الاسم الكامل', mobile: 'رقم الجوال', email: 'البريد الإلكتروني', consent: 'أوافق على التواصل معي' }, submitLabel: 'إرسال الطلب', successMessage: 'شكرًا لك، سنتواصل معك قريبًا.' },
    testimonial: { quote: 'شريك يعرف اسمنا ويسلّم تقريره موقّعًا في موعده، دون طبقات وسيطة ودون مفاجآت.', rating: 5, name: 'عمر السالم', role: 'المدير المالي', company: 'شركة نموذجية للمقاولات', avatar: { src: '/reference/avatar.svg', alt: 'عمر السالم', width: 56, height: 56, decorative: true } },
    ratingLabel: '5 من 5',
  },
  whatsapp: { href: 'https://wa.me/966555346560', label: 'واتساب' },
};
