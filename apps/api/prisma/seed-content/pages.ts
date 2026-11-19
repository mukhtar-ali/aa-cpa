export const seedPages = [
  {
    type: 'site-chrome',
    data: {
      utilityBar: {
        licenseText: { ar: 'ترخيص مهني رقم 123/SOCPA معتمد', en: 'SOCPA Professional License #123' },
        networkText: { ar: 'عضو شبكة التدقيق والمحاسبة العالمية', en: 'Member of International CPA Network' },
        cityText: { ar: 'الرياض • جدة • الخبر', en: 'Riyadh • Jeddah • Khobar' },
      },
      navItems: [
        { label: { ar: 'الرئيسية', en: 'Home' }, href: '/' },
        { label: { ar: 'عن الشركة', en: 'About' }, href: '/about' },
        { label: { ar: 'خدماتنا', en: 'Services' }, href: '/services' },
        { label: { ar: 'القطاعات', en: 'Sectors' }, href: '/sectors' },
        { label: { ar: 'الرؤى والمقالات', en: 'Articles' }, href: '/articles' },
        { label: { ar: 'الوظائف', en: 'Careers' }, href: '/careers' },
        { label: { ar: 'اتصل بنا', en: 'Contact' }, href: '/contact' },
      ],
      headerCta: {
        label: { ar: 'طلب استشارة', en: 'Request Consultation' },
        href: '/contact',
      },
      footerDescription: {
        ar: 'شركة مهنية سعودية معتمدة تقدم خدمات التدقيق المالي، الاستشارات الزكوية والضريبية، وتطوير الحوكمة والأنظمة المالية وفق أرقى المعايير الدولية.',
        en: 'Licensed Saudi CPA firm providing independent audit, zakat and tax compliance, financial advisory, and internal control solutions.',
      },
      crNumber: '1010123456',
      vatNumber: '300123456700003',
      copyright: {
        ar: '© 2026 شركة محاسبون قانونيون. جميع الحقوق محفوظة.',
        en: '© 2026 Certified Public Accountants Firm. All rights reserved.',
      },
      wordmarkText: { ar: 'محاسبون قانونيون', en: 'Certified Public Accountants' },
      socials: [
        { network: 'linkedin', url: 'https://linkedin.com' },
        { network: 'twitter', url: 'https://x.com' },
      ],
      contactChannels: {
        phone: '+966114567890',
        email: 'info@cpa-firm.sa',
        whatsapp: '+966501234567',
        workingHours: { ar: 'الأحد - الخميس: 8:00 ص - 5:00 م', en: 'Sun - Thu: 8:00 AM - 5:00 PM' },
      },
    },
  },
  {
    type: 'page-home',
    data: {
      hero: {
        title: { ar: 'شريكك المهني الموثوق في التدقيق والزكاة والاستشارات المالية', en: 'Your Trusted Partner in Audit, Zakat, and Financial Advisory' },
        accent: { ar: 'وفق معايير عالمية', en: 'With Global Standards' },
        body: { ar: 'نمنح القوائم المالية لشركتك أعلى درجات الموثوقية والشفافية لحماية أصولك وتأمين نمو أعمالك في السوق السعودي.', en: 'Delivering uncompromised financial integrity, precision auditing, and strategic tax clarity across the Kingdom.' },
        primaryCta: { label: { ar: 'استكشف خدماتنا', en: 'Explore Services' }, href: '/services' },
        secondaryCta: { label: { ar: 'احسب التكلفة التقديرية', en: 'Estimate Fee' }, href: '#estimator' },
      },
      gap: {
        eyebrow: { ar: 'لماذا تختارنا', en: 'Why Choose Us' },
        statement: { ar: 'دقة لا تتهاون وخبرة محلية تصنع الفارق', en: 'Uncompromising Rigor, Deep Saudi Expertise' },
        body: { ar: 'في بيئة أعمال سريعة التغير، تحتاج إلى مراجع حسابات يفهم تعقيدات الأنظمة ويدعم استقرارك المالي.', en: 'In a dynamic economy, your business needs seasoned advisors who master local regulations and safeguard compliance.' },
      },
      servicesBlock: {
        eyebrow: { ar: 'مجالات اختصاصنا', en: 'Our Practices' },
        title: { ar: 'خدمات متكاملة تصنع الثقة والامتثال', en: 'Comprehensive Assurance & Tax Advisory' },
        accent: { ar: 'لجميع القطاعات', en: 'For Every Industry' },
        intro: { ar: 'حلول مهنية متخصصة مصممة لتلبية متطلبات الشركات العائلية والمساهمة والمؤسسات المالية.', en: 'Tailored solutions designed for joint stock entities, family conglomerates, and investment funds.' },
        ctaLabel: { ar: 'عرض جميع الخدمات', en: 'View All Services' },
      },
      reasons: {
        title: { ar: 'ركائز تميزنا المهني', en: 'Pillars of Excellence' },
        description: { ar: 'نجمع بين الامتثال الصارم للأنظمة وفهم استراتيجي لأهداف نمو العميل.', en: 'Combining rigorous technical compliance with strategic commercial foresight.' },
        action: { label: { ar: 'تعرف على فريقنا', en: 'Meet Our Leadership' }, href: '/about' },
        pillars: [
          {
            icon: 'Award',
            title: { ar: 'اعتماد رسمي كامل', en: 'Fully Certified' },
            body: { ar: 'تراخيص معتمدة من SOCPA و ZATCA وهيئة السوق المالية.', en: 'Accredited by SOCPA, ZATCA, and the Capital Market Authority.' },
          },
          {
            icon: 'Users',
            title: { ar: 'فريق من النخبة', en: 'Elite Partners' },
            body: { ar: 'مستشارون ومراجعون تزيد خبراتهم عن 20 عاماً في السوق السعودي.', en: 'Partners and managers with over two decades of GCC market experience.' },
          },
          {
            icon: 'Cpu',
            title: { ar: 'تقنيات فحص متطورة', en: 'Advanced Audit Tech' },
            body: { ar: 'استخدام أحدث برمجيات التدقيق وتحليل البيانات واكتشاف الأخطاء بدقة.', en: 'Deploying leading data analytics and digital audit methodologies.' },
          },
        ],
        stats: [
          { value: '20+', label: { ar: 'عاماً من الخبرة', en: 'Years Experience' } },
          { value: '350+', label: { ar: 'عميلاً راضياً', en: 'Corporate Clients' } },
          { value: '99.9%', label: { ar: 'دقة التقارير', en: 'Audit Accuracy' } },
          { value: '3', label: { ar: 'مكاتب رئيسية بالمملكة', en: 'Kingdom Offices' } },
        ],
      },
      credentials: {
        title: { ar: 'تراخيص واعتمادات رسمية', en: 'Official Accreditations & Licenses' },
        description: { ar: 'فخورون بتمثيل أعلى مستويات الثقة في السوق المالي السعودي.', en: 'Proudly licensed to practice before all Saudi regulatory authorities.' },
      },
      process: {
        eyebrow: { ar: 'منهجية العمل', en: 'Engagement Process' },
        title: { ar: 'خطوات مدروسة تضمن أعلى مستويات الجودة', en: 'Structured Methodology for Flawless Execution' },
        accent: { ar: 'من البداية حتى التسليم', en: 'From Scoping to Delivery' },
        description: { ar: 'نتبع إجراءات واضحة تضمن سلاسة العمل واحترام المواعيد المحددة.', en: 'Clear sequential milestones ensuring punctuality and compliance.' },
        steps: [
          { title: { ar: 'جلسة الاستكشاف ونطاق العمل', en: 'Discovery & Scoping' }, body: { ar: 'فهم طبيعة النشاط وتحديد المتطلبات بدقة.', en: 'Understanding the entity and finalizing engagement terms.' } },
          { title: { ar: 'التخطيط وتوزيع المهام', en: 'Planning & Fieldwork' }, body: { ar: 'بناء خطة التدقيق وفحص المستندات والأنظمة.', en: 'Mobilizing field team and testing internal controls.' } },
          { title: { ar: 'المراجعة والتحقق الفني', en: 'Technical Quality Review' }, body: { ar: 'تدقيق النتائج مع الشريك المسؤول ولجنة الجودة.', en: 'Peer review and engagement partner quality sign-off.' } },
          { title: { ar: 'تسليم التقارير والاعتماد', en: 'Final Delivery & Filing' }, body: { ar: 'إصدار التقارير المعتمدة ورفعها عبر المنصات النظامية.', en: 'Issuing certified opinions and filing on regulator portals.' } },
        ],
      },
      partnerQuote: {
        title: { ar: 'النزاهة المهنية هي أثمن ما نقدمه لعملائنا', en: 'Professional Integrity is Our Greatest Asset' },
        body: { ar: 'نحرص على أن يكون تقريرنا المالي حصناً يحمي أعمالكم وشهادة ثقة تدعم تطلعاتكم الاستثمارية.', en: 'We view each audit report as a hallmark of trust that secures your enterprise and supports your aspirations.' },
        action: { label: { ar: 'تواصل معنا مباشرة', en: 'Contact Our Partners' }, href: '/contact' },
      },
      newsBlock: {
        eyebrow: { ar: 'المركز الإعلامي', en: 'Media Center' },
        title: { ar: 'أحدث الرؤى والتحليلات الزكوية والمحاسبية', en: 'Latest Regulatory Insights & Articles' },
        action: { label: { ar: 'عرض جميع المقالات', en: 'View All Insights' }, href: '/articles' },
      },
      estimatorBlock: {
        title: { ar: 'حاسبة الأتعاب التقديرية', en: 'Instant Fee Estimator' },
        body: { ar: 'أجب عن 4 أسئلة سريعة للحصول على نطاق تقديري لأتعاب خدمات التدقيق أو الزكاة المناسبة لحجم منشأتك.', en: 'Answer 4 brief questions to obtain an immediate indicative fee range tailored to your business scale.' },
      },
    },
  },
  {
    type: 'page-about',
    data: {
      hero: {
        title: { ar: 'نبني الثقة ونرسخ معايير الشفافية المالية', en: 'Building Trust and Advancing Financial Transparency' },
        subtitle: { ar: 'نخبة من الكفاءات الوطنية والخبرات العالمية في خدمة الاقتصاد السعودي.', en: 'National talent and seasoned global expertise driving the Saudi economy.' },
      },
      statement: {
        ar: 'تأسست شركتنا لتكون الشريك المهني الأول لمنشآت الأعمال الباحثة عن الدقة والنزاهة والامتثال الكامل للأنظمة السعودية والمعايير الدولية.',
        en: 'Established to serve as the leading assurance and advisory partner for enterprises seeking uncompromised precision, compliance, and growth.',
      },
      commitments: {
        title: { ar: 'قيمنا ومبادئنا المهنية', en: 'Our Core Commitments' },
        subtitle: { ar: 'المبادئ التي تحكم كل تقرير مالي واستشارة نقدمها.', en: 'The foundational pillars that guide every audit engagement we deliver.' },
        items: [
          { icon: 'Shield', title: { ar: 'الاستقلالية والنزاهة', en: 'Independence & Integrity' }, body: { ar: 'حياد مطلق والتزام صارم بآداب وسلوكيات المهنة.', en: 'Strict objectivity and unwavering adherence to professional ethics.' } },
          { icon: 'Target', title: { ar: 'الدقة المتناهية', en: 'Uncompromising Precision' }, body: { ar: 'فحص فني دقيق يضمن سلامة البيانات المالية وعدالتها.', en: 'Rigorous technical scrutiny ensuring financial statements fairness.' } },
          { icon: 'Sparkles', title: { ar: 'الشراكة الاستراتيجية', en: 'Strategic Partnership' }, body: { ar: 'نقدم رؤى تتجاوز مجرد التدقيق لتضيف قيمة حقيقية لأعمالك.', en: 'Delivering insights that transcend routine auditing to add tangible commercial value.' } },
        ],
      },
      officesTitle: { ar: 'شبكة مكاتبنا في المملكة', en: 'Our Office Network Across the Kingdom' },
    },
  },
  {
    type: 'page-services',
    data: {
      hero: {
        title: { ar: 'خدماتنا المهنية المتخصصة', en: 'Our Professional Advisory & Assurance Services' },
        subtitle: { ar: 'منظومة حلول شاملة في التدقيق والزكاة والضرائب والاستشارات المالية.', en: 'End-to-end solutions in external audit, zakat, tax, and corporate finance.' },
      },
      statement: {
        ar: 'نقدم خدمات محاسبية وتدقيقية ترتقي بموثوقية شركتك وتعزز قدرتك على الامتثال للأنظمة وجذب الاستثمارات.',
        en: 'We deliver world-class assurance services that elevate your market credibility and ensure full compliance.'
      },
    },
  },
  {
    type: 'service-shared',
    data: {
      expertCta: {
        title: { ar: 'هل تحتاج إلى استشارة مخصصة لمنشأتك؟', en: 'Need a tailored consultation for your business?' },
        body: { ar: 'تواصل مع أحد شركائنا المتخصصين لمناقشة التحديات والحلول المالية المناسبة.', en: 'Speak with an engagement partner to discuss tailored accounting and tax solutions.' },
        action: { label: { ar: 'تواصل مع خبير', en: 'Speak to an Expert' }, href: '/contact' },
      },
      faqTitle: { ar: 'الأسئلة الشائعة حول خدماتنا', en: 'Frequently Asked Questions' },
      notSureTitle: { ar: 'لست متأكداً من الخدمة التي تحتاجها؟', en: 'Not sure which service fits your entity best?' },
    },
  },
  {
    type: 'page-sectors',
    data: {
      hero: {
        title: { ar: 'خبرات قطاعية عميقة تدعم أعمالك', en: 'Deep Industry Expertise Powering Your Growth' },
        subtitle: { ar: 'فهم دقيق للبيئة التنظيمية والتحديات التشغيلية لكل قطاع حيوي بالمملكة.', en: 'Specialized insight into regulatory mandates and operational nuances across key industries.' },
      },
      statement: {
        ar: 'تتطلب كل صناعة فهماً خاصاً لطبيعة دورة إيراداتها ومخاطرها التشغيلية. نوفر فرق تدقيق متخصصة في كل قطاع.',
        en: 'Every sector operates under distinct regulatory and commercial frameworks. We deploy dedicated industry specialists.'
      },
      indexTitle: { ar: 'القطاعات التي نخدمها', en: 'Industries We Serve' },
      indexDescription: { ar: 'نغطي أكثر من 8 قطاعات حيوية تشمل الخدمات المالية والعقارات والرعاية الصحية.', en: 'Covering 8 major sectors from financial services to energy and technology.' },
    },
  },
  {
    type: 'page-articles',
    data: {
      hero: {
        title: { ar: 'الرؤى المحاسبية والتحليلات الرقابية', en: 'Accounting Insights & Regulatory Analysis' },
        subtitle: { ar: 'أحدث التطورات في لوائح الضرائب والزكاة ومعايير التدقيق وإدارة المخاطر.', en: 'Timely analysis on Saudi tax regulations, IFRS standards, and corporate governance.' },
      },
      featuredTitle: { ar: 'مقال مميز', en: 'Featured Insight' },
      listTitle: { ar: 'جميع الرؤى والمقالات', en: 'All Articles & Updates' },
    },
  },
  {
    type: 'page-careers',
    data: {
      hero: {
        title: { ar: 'انضم إلى فريق يصنع الفارق في مهنة المحاسبة', en: 'Build an Impactful Career with Saudi Arabia’s Premier CPA Firm' },
        subtitle: { ar: 'بيئة مهنية محفزة تدعم شغفك بالتعلم وتمنحك فرصاً واعدة للنمو والقيادة.', en: 'A dynamic, supportive environment fostering professional growth, mentorship, and excellence.' },
      },
      perks: {
        eyebrow: { ar: 'مزايا الانضمام إلينا', en: 'Why Join Us' },
        title: { ar: 'نهتم بتمكين كفاءاتنا وتطوير مساراتهم المهنية', en: 'Committed to Empowering Your Career Journey' },
        items: [
          { icon: 'GraduationCap', title: { ar: 'دعم الشهادات المهنية', en: 'Certification Sponsorship' }, body: { ar: 'تحمل كامل لرسوم اختبارات SOCPA و CPA مع إجازات دراسية مدفوعة.', en: 'Full reimbursement for professional certifications and paid study leave.' } },
          { icon: 'Briefcase', title: { ar: 'خبرات على مشاريع كبرى', en: 'Tier-1 Client Exposure' }, body: { ar: 'العمل مع نخبة من كبرى الشركات المدرجة والصناديق الاستثمارية.', en: 'Direct engagement with leading listed companies and sovereign initiatives.' } },
          { icon: 'Smile', title: { ar: 'بيئة داعمة وإيجابية', en: 'Inclusive Culture' }, body: { ar: 'ثقافة عمل تقدر التوازن والتعاون والاحترام المتبادل بين أفراد الفريق.', en: 'A collaborative, inclusive team culture prioritizing wellness and work-life balance.' } },
          { icon: 'TrendingUp', title: { ar: 'ترقيات سريعة وعادلة', en: 'Merit-Based Growth' }, body: { ar: 'مسار تطور مهني واضح يعتمد على كفاءتك وجهدك وإنجازاتك.', en: 'Transparent, merit-driven progression from Associate to Partner.' } },
        ],
      },
      jobsTitle: { ar: 'الوظائف الشاغرة حالياً', en: 'Current Openings' },
      hiringSteps: {
        eyebrow: { ar: 'رحلة التوظيف', en: 'Hiring Process' },
        title: { ar: 'خطوات بسيطة وشفافة نحو انضمامك إلينا', en: 'Straightforward Path to Joining Our Practice' },
        steps: [
          { title: { ar: 'تقديم الطلب والسيرة الذاتية', en: 'Application Review' }, body: { ar: 'مراجعة ملفك الأكاديمي والمهني خلال 3 أيام عمل.', en: 'We review your CV and qualifications within 3 business days.' } },
          { title: { ar: 'المقابلة الأولية والفحص الفني', en: 'Technical Assessment' }, body: { ar: 'جلسة حوارية لتقييم المهارات الفنية المحاسبية والتحليلية.', en: 'Structured dialogue evaluating your core accounting expertise.' } },
          { title: { ar: 'مقابلة الشريك المسؤول', en: 'Partner Interview' }, body: { ar: 'مناقشة تطلعاتك ومدى توافقها مع ثقافة وقيم الشركة.', en: 'Strategic discussion aligning on long-term goals and firm values.' } },
          { title: { ar: 'العرض الوظيفي وبدء العمل', en: 'Offer & Onboarding' }, body: { ar: 'تقديم عرض وظيفي تنافسي والترحيب بك في الفريق.', en: 'Presenting a competitive offer package and welcome onboarding.' } },
        ],
      },
    },
  },
  {
    type: 'page-contact',
    data: {
      hero: {
        title: { ar: 'تواصل مع خبرائنا المحاسبيين والقانونيين', en: 'Connect with Our Certified Public Accountants' },
        subtitle: { ar: 'يسعدنا الرد على استفساراتكم وترتيب جلسة استشارية أولية مع الشريك المسؤول.', en: 'We welcome your inquiries and look forward to hosting an initial partner discovery meeting.' },
      },
      intro: {
        eyebrow: { ar: 'نحن هنا لمساعدتك', en: 'Always Here to Help' },
        title: { ar: 'استجابة سريعة واستشارات مهنية دقيقة', en: 'Prompt Responses & Dependable Advisory' },
        body: { ar: 'فريقنا متاح عبر مكاتبنا في الرياض وجدة والخبر لتلبية احتياجاتكم المالية والرقابية.', en: 'Our partners and client advisors are available across Riyadh, Jeddah, and Khobar.' },
      },
      form: {
        title: { ar: 'أرسل لنا تفاصيل طلبك', en: 'Send Us Your Inquiry' },
        subtitle: { ar: 'يرجى تزويدنا بالمعلومات الأساسية لنتمكن من توجيه طلبك للشريك المختص.', en: 'Please provide primary details so we can connect you with the appropriate industry practice.' },
        successTitle: { ar: 'تم استلام طلبكم بنجاح', en: 'Inquiry Successfully Received' },
        successBody: { ar: 'شكراً لتواصلكم معنا. سيتواصل معكم أحد مستشارينا خلال يوم عمل واحد (24 ساعة).', en: 'Thank you for reaching out. An engagement advisor will contact you within one business day.' },
      },
      offices: {
        eyebrow: { ar: 'فروعنا بالمملكة', en: 'Kingdom Locations' },
        title: { ar: 'مكاتبنا الرئيسية في خدمتكم', en: 'Our Regional Offices' },
      },
    },
  },
  {
    type: 'legal-privacy',
    data: {
      version: '1.0',
      hero: {
        title: { ar: 'سياسة الخصوصية وحماية البيانات', en: 'Privacy & Personal Data Protection Policy' },
        subtitle: { ar: 'التزامنا بحماية بياناتكم الشخصية وفق نظام حماية البيانات الشخصية السعودي (PDPL).', en: 'Our commitment to protecting your personal data under the Saudi PDPL.' },
      },
      summary: [
        { ar: 'نجمع فقط البيانات اللازمة لتقديم خدماتنا المهنية والتواصل معكم.', en: 'We only collect personal information required to deliver professional services.' },
        { ar: 'لا نشارك بياناتكم مع أي أطراف ثالثة لأغراض تجارية إطلاقاً.', en: 'We never sell or disclose your personal data to commercial third parties.' },
        { ar: 'يحق لك في أي وقت طلب تصحيح أو حذف بياناتك الشخصية من سجلاتنا.', en: 'You retain the full right to access, rectify, or request erasure of your data.' },
      ],
      sections: [
        {
          id: 'collection',
          title: { ar: '1. البيانات التي نجمعها', en: '1. Personal Data We Collect' },
          body: {
            ar: '<p>نقوم بجمع البيانات التي تقدمها طواعية عبر نماذج التواصل والتقديم على الوظائف وحاسبة الأتعاب، مثل الاسم، البريد الإلكتروني، رقم الجوال، واسم المنشأة.</p>',
            en: '<p>We collect information voluntarily submitted via contact forms, job applications, and fee calculators including names, corporate emails, mobile numbers, and company titles.</p>',
          },
        },
        {
          id: 'purpose',
          title: { ar: '2. أغراض معالجة البيانات', en: '2. Purpose of Processing' },
          body: {
            ar: '<p>تُستخدم بياناتكم حصراً للتواصل معكم بخصوص استفساراتكم، وتقديم عروض الأسعار، ودراسة طلبات التوظيف، والامتثال للمتطلبات النظامية والرقابية في المملكة.</p>',
            en: '<p>Data is processed exclusively to address client inquiries, issue fee proposals, evaluate employment candidates, and satisfy statutory compliance obligations in Saudi Arabia.</p>',
          },
        },
      ],
    },
  },
  {
    type: 'legal-terms',
    data: {
      version: '1.0',
      hero: {
        title: { ar: 'الشروط والأحكام المهنية', en: 'Terms & Conditions of Service' },
        subtitle: { ar: 'القواعد والأحكام التي تحكم استخدام موقعنا وخدماتنا المهنية.', en: 'Terms governing website usage and preliminary engagement terms.' },
      },
      summary: [
        { ar: 'المحتوى المنشور للأغراض المعرفية العامة ولا يعد استشارة محاسبية ملزمة بمفرده.', en: 'Content is provided for general informational purposes and does not constitute formal advice.' },
        { ar: 'كافة الخدمات المهنية تخضع لخطابات ارتباط رسمية موقعة بين الطرفين.', en: 'All assurance engagements require formal mutually-executed engagement letters.' },
      ],
      sections: [
        {
          id: 'disclaimer',
          title: { ar: '1. إخلاء المسؤولية المهنية', en: '1. Professional Disclaimer' },
          body: {
            ar: '<p>لا تشكل المعلومات المنشورة على هذا الموقع بديلاً عن الاستشارة المهنية المتخصصة المبنية على فحص كامل لوثائق وحسابات منشأتكم.</p>',
            en: '<p>Information contained herein does not replace customized professional counsel based upon comprehensive scrutiny of company books and records.</p>',
          },
        },
      ],
    },
  },
  {
    type: 'legal-accessibility',
    data: {
      version: '1.0',
      hero: {
        title: { ar: 'بيان إمكانية الوصول وسهولة الاستخدام', en: 'Web Accessibility Commitment' },
        subtitle: { ar: 'نلتزم بإتاحة موقعنا الإلكتروني لكافة المستخدمين بما يتوافق مع معايير WCAG 2.1 AA.', en: 'Committed to universal digital accessibility aligned with WCAG 2.1 AA standards.' },
      },
      summary: [
        { ar: 'دعم كامل لقارئات الشاشة والتنقل عبر لوحة المفاتيح.', en: 'Full support for screen readers and keyboard accessibility.' },
        { ar: 'تباين لوني متوافق مع أعلى معايير سهولة القراءة.', en: 'High contrast color palettes ensuring optimal readability.' },
      ],
      sections: [
        {
          id: 'standards',
          title: { ar: 'معايير إمكانية الوصول المتبعة', en: 'Accessibility Standards' },
          body: {
            ar: '<p>تم تصميم وبناء هذا الموقع ليتوافق مع معايير إمكانية الوصول إلى محتوى الويب (WCAG 2.1) بمستوى المطابقة (AA) لضمان تجربة تصفح شاملة لكافة فئات المجتمع.</p>',
            en: '<p>This digital platform has been engineered to comply with WCAG 2.1 AA guidelines, ensuring inclusive digital interaction for all users including persons with disabilities.</p>',
          },
        },
      ],
    },
  },
  {
    type: 'notification-settings',
    data: {
      defaultInbox: 'leads@cpa-firm.sa',
      serviceRecipients: {
        'external-audit': ['audit-leads@cpa-firm.sa'],
        'tax-zakat-advisory': ['tax-leads@cpa-firm.sa'],
      },
      careersInbox: 'careers@cpa-firm.sa',
      retentionMonths: 24,
    },
  },
  {
    type: 'spam-settings',
    data: {
      turnstileEnabled: false,
      turnstileSiteKey: '',
      minFillSeconds: 3,
    },
  },
];
