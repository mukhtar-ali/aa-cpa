export const seedCategories = [
  {
    slug: 'insights',
    name: { ar: 'رؤى محاسبية ورقابية', en: 'Accounting & Regulatory Insights' },
    order: 1,
    isCaseStory: false,
  },
  {
    slug: 'tax-updates',
    name: { ar: 'تحديثات الزكاة والضريبة', en: 'Zakat & Tax Updates' },
    order: 2,
    isCaseStory: false,
  },
  {
    slug: 'case-stories',
    name: { ar: 'قصص نجاح ودراسات حالة', en: 'Success Stories & Case Studies' },
    order: 3,
    isCaseStory: true,
  },
];

export const seedAuthors = [
  {
    name: { ar: 'د. عبد الله المنصور', en: 'Dr. Abdullah Al-Mansoor' },
    role: { ar: 'شريك أول - رئيس قطاع التدقيق', en: 'Senior Partner - Head of Audit' },
    bio: {
      ar: 'محاسب قانوني معتمد (SOCPA / CPA) بخبرة تزيد عن 22 عاماً في قيادة مهام التدقيق المالي لكبرى الشركات المساهمة والمؤسسات المالية في المملكة.',
      en: 'Licensed CPA & SOCPA partner with over 22 years of experience leading audit engagements for major listed companies and financial institutions in Saudi Arabia.',
    },
    order: 1,
  },
  {
    name: { ar: 'أ. سارة القحطاني', en: 'Sarah Al-Qahtani' },
    role: { ar: 'شريكة قطاع الضرائب والتسعير التحويلي', en: 'Partner - Tax & Transfer Pricing' },
    bio: {
      ar: 'مستشارة ضريبية معتمدة وخبيرة سابقة في السياسات الضريبية وهيئة الزكاة، متخصصة في التخطيط الضريبي الدولي والنزاعات الزكوية.',
      en: 'Certified tax consultant and former tax policy specialist, focused on international corporate taxation, ZATCA disputes, and transfer pricing.',
    },
    order: 2,
  },
];

export const seedArticles = [
  {
    slug: 'saudi-corporate-tax-guide-2026',
    categorySlug: 'tax-updates',
    authorIndex: 1,
    readingMinutes: 6,
    isFeatured: true,
    isPublished: true,
    publishedAt: new Date('2026-02-15T00:00:00Z'),
    tags: [
      { ar: 'ضريبة الدخل', en: 'Corporate Tax' },
      { ar: 'الزكاة والضريبة', en: 'ZATCA' },
      { ar: 'التسعير التحويلي', en: 'Transfer Pricing' },
    ],
    translations: {
      ar: {
        title: 'الدليل التنفيذي لأحدث التعديلات في اللوائح الزكوية والضريبية لعام 2026',
        excerpt: 'قراءة شاملة لأبرز التحديثات الصادرة عن هيئة الزكاة والضريبة والجمارك وتأثيرها المباشر على الشركات العاملة في المملكة.',
        body: '<h2>نظرة عامة على البيئة الضريبية المتطورة</h2><p>تشهد المملكة العربية السعودية تحولاً متسارعاً في منظومة الامتثال الضريبي والزكوي، حيث أطلقت هيئة الزكاة والضريبة والجمارك حزمة من التعديلات الهادفة لتعزيز الشفافية والربط الرقمي التكاملي.</p><h3>أهم التعديلات الجوهرية</h3><p>شملت التعديلات توسيع نطاق متطلبات التسعير التحويلي، وتحديث معايير فحص الحسابات الزكوية للشركات ذات الملكية المشتركة، بالإضافة إلى تعزيز التكامل مع المرحلة الثانية من الفاتورة الإلكترونية (مرحلة الربط والتكامل).</p><h3>خطوات عملية للاستعداد</h3><ul><li>مراجعة الوعاء الزكوي قبل نهاية الربع المالي.</li><li>تحديث توثيق الملف المحلي والملف الرئيسي للتسعير التحويلي.</li><li>التأكد من التوافق التقني والتشغيلي للأنظمة المحاسبية مع منصة فاتورة.</li></ul>',
        metaTitle: 'دليل التعديلات الزكوية والضريبية 2026 | محاسبون قانونيون',
        metaDescription: 'تحليل مهني متكامل لأحدث لوائح هيئة الزكاة والضريبة وتأثيرها على قطاع الأعمال في السعودية.',
      },
      en: {
        title: 'Executive Guide to the 2026 Saudi Zakat and Tax Regulatory Updates',
        excerpt: 'A comprehensive overview of ZATCA updates and their strategic implications for businesses in Saudi Arabia.',
        body: '<h2>Navigating the Evolving Tax Landscape</h2><p>Saudi Arabia continues to advance its regulatory and tax framework, strengthening transparency and digital compliance across all commercial sectors.</p><h3>Key Regulatory Shifts</h3><p>Updates focus on enhanced transfer pricing disclosures, revised zakat calculation rules for mixed-ownership entities, and widespread Phase 2 e-invoicing integration.</p><h3>Actionable Next Steps</h3><ul><li>Evaluate zakat base adjustments ahead of fiscal year-end.</li><li>Review local and master transfer pricing files for cross-border related party transactions.</li><li>Audit ERP system readiness for automated clearance and reporting.</li></ul>',
        metaTitle: 'Saudi Zakat & Tax Updates 2026 | CPA Insights',
        metaDescription: 'Expert analysis of new ZATCA regulations, transfer pricing guidelines, and e-invoicing compliance.',
      },
    },
  },
  {
    slug: 'internal-controls-framework-saudi-enterprises',
    categorySlug: 'insights',
    authorIndex: 0,
    readingMinutes: 8,
    isFeatured: false,
    isPublished: true,
    publishedAt: new Date('2026-01-20T00:00:00Z'),
    tags: [
      { ar: 'الحوكمة', en: 'Governance' },
      { ar: 'الرقابة الداخلية', en: 'Internal Controls' },
      { ar: 'إدارة المخاطر', en: 'Risk Management' },
    ],
    translations: {
      ar: {
        title: 'بناء منظومة رقابة داخلية متماسكة: ركيزة أساسية لاستدامة الشركات ونموها',
        excerpt: 'كيف تساهم أنظمة الرقابة الداخلية الفاعلة في تقليل المخاطر التشغيلية والمالية وتأهيل الشركات للطرح العام أو جذب الاستثمارات.',
        body: '<h2>أهمية الرقابة الداخلية في الشركات الحديثة</h2><p>لم تعد الرقابة الداخلية مجرد متطلب شكلي أو التزام تنظيمي، بل أصبحت أداة حيوية لحماية الأصول وتحسين كفاءة العمليات وضمان مصداقية البيانات المالية المرفوعة للإدارة العليا ومجلس الإدارة.</p><h3>أركان نموذج COSO المطبق</h3><p>يعتمد النهج الرقابي الحديث على خمسة مكونات رئيسية تبدأ ببيئة الرقابة وتحديد المخاطر، وتنتهي بأنشطة الرصد والمتابعة المستمرة.</p>',
        metaTitle: 'بناء منظومة الرقابة الداخلية وإدارة المخاطر | محاسبون قانونيون',
        metaDescription: 'دليل عملي لتصميم وتطبيق أنظمة الرقابة الداخلية الفاعلة في الشركات السعودية وفق إطار COSO.',
      },
      en: {
        title: 'Building a Resilient Internal Controls Framework for Saudi Enterprises',
        excerpt: 'How robust internal control systems mitigate operational risks and prepare companies for IPOs and private equity capital.',
        body: '<h2>Strategic Value of Internal Control Systems</h2><p>Internal controls serve as the primary defensive line safeguarding corporate assets and ensuring reliable financial reporting for executive leadership and boards.</p><h3>Core Pillars of the COSO Framework</h3><p>Implementing structured risk assessment, control activities, and monitoring mechanisms tailored to rapid growth environments.</p>',
        metaTitle: 'Internal Controls & Risk Management Framework | CPA Insights',
        metaDescription: 'Practical guide to establishing robust internal control environments under international best practices.',
      },
    },
  },
  {
    slug: 'case-story-retail-financial-transformation',
    categorySlug: 'case-stories',
    authorIndex: 0,
    readingMinutes: 5,
    isFeatured: true,
    isPublished: true,
    publishedAt: new Date('2026-02-01T00:00:00Z'),
    tags: [
      { ar: 'دراسة حالة', en: 'Case Study' },
      { ar: 'التجزئة', en: 'Retail' },
      { ar: 'التحول المالي', en: 'Financial Transformation' },
    ],
    translations: {
      ar: {
        title: 'قصة نجاح: إعادة هيكلة وتطوير الإدارة المالية لمجموعة تجزئة سعودية كبرى',
        excerpt: 'كيف ساعدت شركة المحاسبين القانونيين سلسلة تجزئة تضم أكثر من 60 فرعاً في أتمتة المطابقات النقدية وخفض زمن الإقفال المالي بنسبة 60%.',
        body: '<h2>التحدي</h2><p>واجهت المجموعة صعوبات في مطابقة مبيعات الفروع اليومية مع بوابات الدفع الإلكتروني، مما أدى لتأخر إقفال القوائم المالية الشهرية وزيادة مخاطر التسويات المعلقة.</p><h2>الحل والمنهجية</h2><p>صمم فريقنا نموذجاً متكاملاً لإدارة النقدية والمطابقات التلقائية وربط نقاط البيع (POS) بنظام الـ ERP المركزي مباشرة وفق معايير رقابية صارمة.</p><h2>النتائج المحققة</h2><ul><li>تقليص فترة الإقفال الشهري من 25 يوماً إلى 4 أيام عمل فقط.</li><li>معالجة وتسوية فروقات محاسبية سابقة بأكثر من 14 مليون ريال.</li><li>جاهزية كاملة لمتطلبات الفحص الزكوي والتدقيق الخارجي دون أي تحفظات.</li></ul>',
        metaTitle: 'دراسة حالة: التحول المالي لشركة تجزئة رائدة | محاسبون قانونيون',
        metaDescription: 'دراسة حالة توضح كيف نجحنا في تطوير الإدارة المالية وأتمتة المطابقات لشركة تجزئة كبرى في المملكة.',
      },
      en: {
        title: 'Case Study: Financial Operations Transformation for a Leading Retail Group',
        excerpt: 'How we helped a multi-store retail chain automate reconciliations and reduce monthly financial closing cycle by 60%.',
        body: '<h2>The Challenge</h2><p>High transaction volumes across 60+ outlets created reconciliation bottlenecks between point-of-sale systems and bank settlement files.</p><h2>Our Approach</h2><p>We engineered automated reconciliation workflows, standardized chart of accounts, and enforced daily control verification.</p><h2>Measurable Outcomes</h2><ul><li>Reduced month-end closing from 25 days to just 4 business days.</li><li>Resolved legacy variance items exceeding SAR 14 million.</li><li>Achieved a clean audit opinion and seamless ZATCA audit closure.</li></ul>',
        metaTitle: 'Retail Financial Transformation Case Study | CPA Firm',
        metaDescription: 'Case study on financial restructuring, automated reconciliation, and internal controls for a retail enterprise.',
      },
    },
  },
];
