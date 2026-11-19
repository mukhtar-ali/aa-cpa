export const seedDepartments = [
  {
    slug: 'audit-assurance',
    name: { ar: 'التدقيق والتأكيد', en: 'Audit & Assurance' },
    order: 1,
  },
  {
    slug: 'tax-zakat',
    name: { ar: 'الزكاة والضرائب', en: 'Zakat & Tax' },
    order: 2,
  },
  {
    slug: 'advisory',
    name: { ar: 'الاستشارات المالية والصفقات', en: 'Financial Advisory' },
    order: 3,
  },
];

export const seedJobs = [
  {
    slug: 'senior-audit-associate',
    departmentSlug: 'audit-assurance',
    employmentType: 'full_time' as const,
    experienceMin: 3,
    experienceMax: 6,
    order: 1,
    isPublished: true,
    publishedAt: new Date('2026-01-10T00:00:00Z'),
    closesAt: new Date('2026-12-31T23:59:59Z'),
    responsibilities: [
      { ar: 'قيادة فرق المراجعة الميدانية وتنفيذ خطط التدقيق المالي وفق معايير SOCPA و IFRS.', en: 'Leading field audit teams and executing audit programs under SOCPA and IFRS standards.' },
      { ar: 'فحص الحسابات والعمليات الجوهرية وإعداد مسودات أوراق العمل وتقارير المراجعة.', en: 'Testing complex account balances, drafting working papers and independent audit deliverables.' },
      { ar: 'التواصل الفعال مع ممثلي العملاء ومناقشة ملاحظات الرقابة الداخلية وإعداد خطاب الإدارة.', en: 'Liaising with client leadership and communicating internal control recommendations.' },
    ],
    requirements: [
      { ar: 'درجة البكالوريوس في المحاسبة أو المالية من جامعة معترف بها.', en: 'Bachelor degree in Accounting or Finance from an accredited university.' },
      { ar: 'الحصول على شهادة زمالة الهيئة السعودية (SOCPA) أو CPA أو السعي الجاد لإكمالها.', en: 'SOCPA, CPA, or ACCA certification (or final stages of qualification).' },
      { ar: 'خبرة عملية لا تقل عن 3 سنوات في مكاتب تدقيق ومحاسبة معتمدة في المملكة.', en: 'Minimum 3 years of progressive experience in recognized professional accounting firms.' },
    ],
    benefits: [
      {
        title: { ar: 'تطوير مهني مستمر', en: 'Professional Development' },
        body: { ar: 'تغطية تكاليف ورسوم اختبارات وتجديد شهادات SOCPA و CPA مع دورات تدريبية متقدمة.', en: 'Full sponsorship for SOCPA / CPA exam fees and advanced technical trainings.' },
      },
      {
        title: { ar: 'تأمين طبي فئة VIP', en: 'VIP Medical Coverage' },
        body: { ar: 'تأمين صحي شامل للموظف وعائلته في أرقى شبكات المستشفيات والمراكز الطبية بالمملكة.', en: 'Comprehensive health coverage for employee and dependents in top-tier medical networks.' },
      },
      {
        title: { ar: 'بيئة عمل مرنة وتنافسية', en: 'Competitive Package' },
        body: { ar: 'رواتب تنافسية ومكافآت أداء سنوية وبدل سكن ونقل مجزي.', en: 'Attractive salary, annual performance bonuses, housing, and transportation allowances.' },
      },
    ],
    translations: {
      ar: {
        title: 'مراجع أول - التدقيق الخارجي',
        summary: 'فرصة مهنية متميزة لمحاسب طموح لقيادة فرق المراجعة وخدمة نخبة من كبرى الشركات في المملكة.',
        body: '<h2>عن الدور الوظيفي</h2><p>نبحث عن مراجع أول متميز يتمتع بشغف مهني وقدرات تحليلية عالية للانضمام لفريق التدقيق والتأكيد في مقرنا الرئيسي بالرياض. ستتولى قيادة مهام التدقيق الميداني والإشراف على المحاسبين المساعدين والتأكد من جودة ملفات التدقيق وفق أعلى المعايير المهنية.</p>',
        location: 'الرياض (المقر الرئيسي)',
        metaTitle: 'وظيفة مراجع أول تدقيق خارجي | وظائف الرياض',
        metaDescription: 'انضم لفريق التدقيق الخارجي الرائد في الرياض. متطلبات وظيفية وفرص تطوير مهني للمحاسبين المعتمدين.',
      },
      en: {
        title: 'Senior Associate - External Audit',
        summary: 'Exceptional career opportunity for a passionate auditor to lead field teams and advise top-tier Saudi enterprises.',
        body: '<h2>About the Position</h2><p>We are seeking a high-caliber Senior Audit Associate to join our expanding assurance practice in Riyadh. You will lead client engagements, mentor associates, and deliver rigorous audit execution adhering to international quality frameworks.</p>',
        location: 'Riyadh (Headquarters)',
        metaTitle: 'Senior External Audit Associate Job | Riyadh',
        metaDescription: 'Exciting career opportunity for experienced audit professionals in Riyadh. Apply today.',
      },
    },
  },
  {
    slug: 'tax-zakat-consultant',
    departmentSlug: 'tax-zakat',
    employmentType: 'full_time' as const,
    experienceMin: 2,
    experienceMax: 5,
    order: 2,
    isPublished: true,
    publishedAt: new Date('2026-01-15T00:00:00Z'),
    closesAt: new Date('2026-12-31T23:59:59Z'),
    responsibilities: [
      { ar: 'إعداد الإقرارات الزكوية وضريبة الدخل وضريبة القيمة المضافة ومراجعتها بدقة.', en: 'Preparing and reviewing zakat, corporate income tax, and VAT returns with precision.' },
      { ar: 'متابعة ملفات العملاء على بوابة هيئة الزكاة والضريبة والجمارك (ZATCA) والرد على الاستفسارات.', en: 'Managing client files on the ZATCA portal and drafting responses to tax inquiries.' },
      { ar: 'المشاركة في دراسات التخطيط الضريبي والتحقق من متطلبات التسعير التحويلي.', en: 'Contributing to tax planning studies and transfer pricing documentation.' },
    ],
    requirements: [
      { ar: 'بكالوريوس في المحاسبة أو الضرائب أو القانون المالي.', en: 'Bachelor in Accounting, Taxation, or Commercial Law.' },
      { ar: 'إتقان تام للوائح وأنظمة هيئة الزكاة والضريبة والجمارك السعودية.', en: 'Solid understanding of Saudi tax legislation, ZATCA circulars, and VAT implementation.' },
      { ar: 'خبرة من 2 إلى 5 سنوات في الاستشارات الضريبية والزكوية.', en: '2 to 5 years of relevant tax experience in the Kingdom.' },
    ],
    benefits: [
      {
        title: { ar: 'مسار وظيفي واضح', en: 'Structured Career Path' },
        body: { ar: 'فرص ترقية دورية وخطط تدريب معتمدة في تخصصات الضرائب المتقدمة.', en: 'Clear progression criteria and specialized tax certifications.' },
      },
      {
        title: { ar: 'مكافآت وحوافز إنجاز', en: 'Performance Incentives' },
        body: { ar: 'مكافآت تشجيعية مرتبطة بنجاح إغلاق ملفات الفحص والاعتراضات الزكوية.', en: 'Performance-driven bonuses tied to project delivery and client satisfaction.' },
      },
    ],
    translations: {
      ar: {
        title: 'مستشار زكاة وضرائب',
        summary: 'انضم لفريق الاستشارات الضريبية لتقديم حلول ذكية ومتوافقة لنخبة من المنشآت المحلية والدولية.',
        body: '<h2>عن الدور الوظيفي</h2><p>يمثل مستشار الضرائب والزكاة عنصراً محورياً في مساعدة شركائنا على الوفاء بالتزاماتهم النظامية وتجنب المخاطر، والتعامل الاحترافي مع كافة متطلبات هيئة الزكاة والضريبة والجمارك.</p>',
        location: 'الرياض / جدة',
        metaTitle: 'وظيفة مستشار زكاة وضرائب | وظائف محاسبة',
        metaDescription: 'فرصة عمل لمستشاري الزكاة والضرائب ذوي الخبرة في اللوائح السعودية وهيئة الزكاة.',
      },
      en: {
        title: 'Zakat & Tax Consultant',
        summary: 'Join our dedicated tax practice to provide compliant advisory services to prominent regional and global clients.',
        body: '<h2>Role Overview</h2><p>As a Tax & Zakat Consultant, you will play an integral role in structuring tax compliance, resolving technical inquiries, and representing clients before ZATCA.</p>',
        location: 'Riyadh / Jeddah',
        metaTitle: 'Zakat & Tax Consultant Job | Saudi Arabia',
        metaDescription: 'Career opening for skilled tax and zakat advisors in Saudi Arabia.',
      },
    },
  },
];
