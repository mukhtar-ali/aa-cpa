export const seedOffices = [
  {
    city: { ar: 'الرياض (المقر الرئيسي)', en: 'Riyadh (Headquarters)' },
    address: {
      ar: 'طريق الملك فهد، حي العليا، برج الأعمال، الطابق 18، ص.ب 12345، الرياض، المملكة العربية السعودية',
      en: 'King Fahd Road, Al Olaya District, Business Tower, 18th Floor, PO Box 12345, Riyadh, Saudi Arabia',
    },
    mapUrl: 'https://maps.google.com/?q=24.7136,46.6753',
    mapX: 52,
    mapY: 48,
    isHeadquarters: true,
    order: 1,
    isPublished: true,
  },
  {
    city: { ar: 'جدة (المنطقة الغربية)', en: 'Jeddah (Western Region)' },
    address: {
      ar: 'طريق الأمير محمد بن عبد العزيز (التحلية)، حي الأندلس، جدة، المملكة العربية السعودية',
      en: 'Prince Mohammed Bin Abdulaziz (Tahlia) Road, Al Andalus District, Jeddah, Saudi Arabia',
    },
    mapUrl: 'https://maps.google.com/?q=21.5433,39.1728',
    mapX: 28,
    mapY: 58,
    isHeadquarters: false,
    order: 2,
    isPublished: true,
  },
  {
    city: { ar: 'الخبر (المنطقة الشرقية)', en: 'Al Khobar (Eastern Province)' },
    address: {
      ar: 'طريق الملك فيصل، حي اليرموك، برج الشاطئ، الخبر، المملكة العربية السعودية',
      en: 'King Faisal Road, Al Yarmouk District, Beach Tower, Al Khobar, Saudi Arabia',
    },
    mapUrl: 'https://maps.google.com/?q=26.2172,50.1971',
    mapX: 74,
    mapY: 44,
    isHeadquarters: false,
    order: 3,
    isPublished: true,
  },
];

export const seedTestimonials = [
  {
    quote: {
      ar: 'فريق مهني على أعلى طراز. ساعدونا في تجاوز تحديات معقدة في الفحص الزكوي وإعادة هيكلة القوائم المالية بسلاسة ودقة لا مثيل لها.',
      en: 'An exceptional professional firm. They guided us through complex ZATCA audit examinations and restructuring with flawless precision.',
    },
    rating: 5,
    name: { ar: 'م. خالد الراشد', en: 'Eng. Khalid Al-Rashed' },
    role: { ar: 'الرئيس التنفيذي للمالية', en: 'Chief Financial Officer' },
    company: { ar: 'شركة التطوير الصناعي القابضة', en: 'Industrial Development Holding' },
    placement: ['home', 'about', 'services'],
    order: 1,
    isPublished: true,
  },
  {
    quote: {
      ar: 'التزامهم بالمواعيد والصرامة الرقابية منح مجلس الإدارة ثقة مطلقة في سلامة أرقامنا المالية قبل إعلان النتائج السنوية.',
      en: 'Their strict adherence to timelines and uncompromising audit rigor gave our board total confidence in our year-end financial disclosures.',
    },
    rating: 5,
    name: { ar: 'أ. فهد السديري', en: 'Fahad Al-Sudairi' },
    role: { ar: 'رئيس لجنة المراجعة', en: 'Chairman of Audit Committee' },
    company: { ar: 'مجموعة المشرق للخدمات اللوجستية', en: 'Mashreq Logistics Group' },
    placement: ['home', 'services', 'sectors'],
    order: 2,
    isPublished: true,
  },
  {
    quote: {
      ar: 'خبرتهم العميقة في متطلبات هيئة السوق المالية ساعدتنا في إتمام عملية الفحص النافي للجهالة لصفقة استحواذ كبرى بنجاح مبهر.',
      en: 'Their profound understanding of CMA regulations proved invaluable in concluding our major cross-border M&A due diligence successfully.',
    },
    rating: 5,
    name: { ar: 'أ. ريم الدوسري', en: 'Reem Al-Dossary' },
    role: { ar: 'مديرة الاستثمار والصفقات', en: 'Investment & M&A Director' },
    company: { ar: 'صندوق الابتكار للاستثمار الجريء', en: 'Innovation Venture Capital' },
    placement: ['home', 'about'],
    order: 3,
    isPublished: true,
  },
];

export const seedClientLogos = [
  { name: 'Saudi Industrial Group', row: 1, order: 1, isPublished: true, logo: { url: '/images/clients/client-1.svg', width: 160, height: 60, alt: { ar: 'المجموعة الصناعية', en: 'Saudi Industrial Group' } } },
  { name: 'Al-Madina Real Estate', row: 1, order: 2, isPublished: true, logo: { url: '/images/clients/client-2.svg', width: 160, height: 60, alt: { ar: 'شركة المدينة العقارية', en: 'Al-Madina Real Estate' } } },
  { name: 'National Logistics Co', row: 1, order: 3, isPublished: true, logo: { url: '/images/clients/client-3.svg', width: 160, height: 60, alt: { ar: 'الشركة الوطنية للخدمات اللوجستية', en: 'National Logistics Co' } } },
  { name: 'Gulf Healthcare Holdings', row: 1, order: 4, isPublished: true, logo: { url: '/images/clients/client-4.svg', width: 160, height: 60, alt: { ar: 'القابضة للرعاية الصحية', en: 'Gulf Healthcare Holdings' } } },
  { name: 'Tadawul Listed Tech', row: 2, order: 1, isPublished: true, logo: { url: '/images/clients/client-5.svg', width: 160, height: 60, alt: { ar: 'شركة تقنية مدرجة', en: 'Tadawul Listed Tech' } } },
  { name: 'Al-Safwa Energy', row: 2, order: 2, isPublished: true, logo: { url: '/images/clients/client-6.svg', width: 160, height: 60, alt: { ar: 'الصفوة للطاقة', en: 'Al-Safwa Energy' } } },
  { name: 'Horizon Retail Chain', row: 2, order: 3, isPublished: true, logo: { url: '/images/clients/client-7.svg', width: 160, height: 60, alt: { ar: 'سلسلة متاجر هورايزون', en: 'Horizon Retail Chain' } } },
  { name: 'Capital Ventures KSA', row: 2, order: 4, isPublished: true, logo: { url: '/images/clients/client-8.svg', width: 160, height: 60, alt: { ar: 'كابيتال فنتشرز السعودية', en: 'Capital Ventures KSA' } } },
];

export const seedCredentials = [
  {
    name: { ar: 'ترخيص الهيئة السعودية للمراجعين والمحاسبين (SOCPA)', en: 'Licensed by Saudi Organization for CPAs (SOCPA)' },
    logo: { url: '/images/credentials/socpa.svg', width: 180, height: 70, alt: { ar: 'شعار SOCPA', en: 'SOCPA Logo' } },
    url: 'https://socpa.org.sa',
    order: 1,
    isPublished: true,
  },
  {
    name: { ar: 'مراجع معتمد لدى هيئة الزكاة والضريبة والجمارك (ZATCA)', en: 'ZATCA Registered Tax & Zakat Auditor' },
    logo: { url: '/images/credentials/zatca.svg', width: 180, height: 70, alt: { ar: 'شعار ZATCA', en: 'ZATCA Logo' } },
    url: 'https://zatca.gov.sa',
    order: 2,
    isPublished: true,
  },
  {
    name: { ar: 'معتمد لدى هيئة السوق المالية (CMA)', en: 'Capital Market Authority (CMA) Registered' },
    logo: { url: '/images/credentials/cma.svg', width: 180, height: 70, alt: { ar: 'شعار هيئة السوق المالية', en: 'CMA Logo' } },
    url: 'https://cma.org.sa',
    order: 3,
    isPublished: true,
  },
  {
    name: { ar: 'عضو الاتحاد الدولي للمحاسبين (IFAC)', en: 'Affiliated with International Federation of Accountants' },
    logo: { url: '/images/credentials/ifac.svg', width: 180, height: 70, alt: { ar: 'شعار IFAC', en: 'IFAC Logo' } },
    url: 'https://ifac.org',
    order: 4,
    isPublished: true,
  },
];

export const seedFaqs = [
  {
    scope: 'global' as const,
    order: 1,
    isPublished: true,
    question: {
      ar: 'ما هي المعايير المحاسبية المعتمدة التي تلتزم بها شركتكم في التدقيق؟',
      en: 'Which accounting standards do you follow in auditing client financials?',
    },
    answer: {
      ar: '<p>نلتزم بشكل كامل بالمعايير الدولية للتقرير المالي المعتمدة في المملكة العربية السعودية (IFRS-KSA) ومعايير التدقيق الدولية (ISA) الصادرة عن الهيئة السعودية للمراجعين والمحاسبين (SOCPA).</p>',
      en: '<p>We fully adhere to International Financial Reporting Standards as endorsed in Saudi Arabia (IFRS-KSA) and International Standards on Auditing (ISA) promulgated by SOCPA.</p>',
    },
  },
  {
    scope: 'global' as const,
    order: 2,
    isPublished: true,
    question: {
      ar: 'كم يستغرق إنجاز عملية التدقيق المالي السنوي عادةً؟',
      en: 'How long does an annual financial audit typically take?',
    },
    answer: {
      ar: '<p>تعتمد المدة على حجم المنشأة وتنوع فروعها وجاهزية سجلاتها المحاسبية، وتتراوح عادةً بين 3 إلى 6 أسابيع من تاريخ استلام كافة الجداول والمستندات المؤيدة اللازمة.</p>',
      en: '<p>Engagements typically span between 3 to 6 weeks from receipt of full supporting schedules and trial balances, depending on company scale and complexity.</p>',
    },
  },
  {
    scope: 'contact' as const,
    order: 3,
    isPublished: true,
    question: {
      ar: 'ما هي أوقات الاستجابة لطلبات التواصل واستفسارات عروض الأسعار؟',
      en: 'What is the expected response turnaround for contact inquiries and quotes?',
    },
    answer: {
      ar: '<p>يلتزم فريق الاستشارات بالتواصل معكم خلال يوم عمل واحد (24 ساعة) لمناقشة متطلباتكم وتحديد موعد جلسة اكتشاف أولية مع الشريك المسؤول.</p>',
      en: '<p>Our client advisory team responds within one business day (24 hours) to arrange an initial scoping meeting with the designated engagement partner.</p>',
    },
  },
];
