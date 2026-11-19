export const seedEstimatorConfig = {
  status: 'approved' as const,
  currency: 'SAR',
  spreadPercent: 15,
  roundingTo: 500,
  disclaimer: {
    ar: 'هذا النطاق السعري تقديري استرشادي فقط ولا يعتبر عرض أسعار ملزم أو نهائي. يتوقف تحديد الأتعاب الرسمية على الفحص الأولي لحجم العمل وسجلات المنشأة وخطاب الارتباط الرسمي.',
    en: 'This indicative fee range is purely illustrative and does not constitute a legally binding quotation. Final engagement fees are determined following formal scoping, trial balance review, and execution of an engagement letter.',
  },
  questions: [
    {
      id: 'service_type',
      title: { ar: 'ما هي الخدمة المهنية المطلوبة؟', en: 'What service do you require?' },
      type: 'select' as const,
      options: [
        { id: 'external-audit', label: { ar: 'التدقيق والتأكيد الخارجي', en: 'External Audit' }, value: 'external-audit' },
        { id: 'tax-zakat', label: { ar: 'الزكاة والضرائب', en: 'Zakat & Tax Advisory' }, value: 'tax-zakat' },
        { id: 'internal-audit', label: { ar: 'التدقيق الداخلي وإدارة المخاطر', en: 'Internal Audit & Risk' }, value: 'internal-audit' },
        { id: 'accounting-bookkeeping', label: { ar: 'المحاسبة ومسك الدفاتر', en: 'Accounting & Bookkeeping' }, value: 'accounting-bookkeeping' },
      ],
    },
    {
      id: 'revenue_scale',
      title: { ar: 'حجم الإيرادات السنوية التقريبية للمنشأة؟', en: 'What is your approximate annual revenue?' },
      type: 'select' as const,
      options: [
        { id: 'rev_small', label: { ar: 'أقل من 5 ملايين ريال', en: 'Less than SAR 5M' }, value: 5000000 },
        { id: 'rev_medium', label: { ar: 'من 5 إلى 20 مليون ريال', en: 'SAR 5M - 20M' }, value: 20000000 },
        { id: 'rev_large', label: { ar: 'من 20 إلى 50 مليون ريال', en: 'SAR 20M - 50M' }, value: 50000000 },
        { id: 'rev_enterprise', label: { ar: 'أكثر من 50 مليون ريال', en: 'Over SAR 50M' }, value: 100000000 },
      ],
    },
    {
      id: 'entity_type',
      title: { ar: 'الشكل القانوني للمنشأة؟', en: 'What is your legal entity type?' },
      type: 'radio' as const,
      options: [
        { id: 'llc', label: { ar: 'شركة ذات مسؤولية محدودة', en: 'Limited Liability Company (LLC)' }, value: 'llc' },
        { id: 'joint_stock', label: { ar: 'شركة مساهمة (مقفلة / مدرجة)', en: 'Joint Stock Company' }, value: 'joint_stock' },
        { id: 'establishment', label: { ar: 'مؤسسة فردية', en: 'Sole Proprietorship' }, value: 'establishment' },
        { id: 'foreign_branch', label: { ar: 'فرع شركة أجنبية', en: 'Foreign Branch' }, value: 'foreign_branch' },
      ],
    },
    {
      id: 'books_condition',
      title: { ar: 'حالة السجلات المحاسبية والأنظمة المالية؟', en: 'Current state of accounting records?' },
      type: 'radio' as const,
      options: [
        { id: 'organized_erp', label: { ar: 'نظام سحابي منتظم (ERP) مع مطابقات محدثة', en: 'Up-to-date cloud ERP with monthly reconciliations' }, value: 'organized_erp' },
        { id: 'manual_sheets', label: { ar: 'ملفات إكسل أو برامج محلية تحتاج تسويات', en: 'Excel spreadsheets or local accounting software' }, value: 'manual_sheets' },
        { id: 'delayed_unreconciled', label: { ar: 'سجلات غير مكتملة أو متأخرة لأكثر من سنة', en: 'Unreconciled or backlog exceeding one fiscal year' }, value: 'delayed_unreconciled' },
      ],
    },
  ],
  pricing: {
    serviceBases: {
      'external-audit': 25000,
      'tax-zakat': 18000,
      'internal-audit': 35000,
      'accounting-bookkeeping': 12000,
    },
    revenueBands: [
      { maxRevenue: 5000000, factor: 1.0 },
      { maxRevenue: 20000000, factor: 1.4 },
      { maxRevenue: 50000000, factor: 1.8 },
      { maxRevenue: 999999999, factor: 2.5 },
    ],
    entityFactors: {
      establishment: 0.85,
      llc: 1.0,
      foreign_branch: 1.35,
      joint_stock: 1.7,
    },
    booksFactors: {
      organized_erp: 1.0,
      manual_sheets: 1.3,
      delayed_unreconciled: 1.65,
    },
  },
};
