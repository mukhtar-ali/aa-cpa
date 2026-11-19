import { ReferenceMapper } from './reference.mapper';

describe('ReferenceMapper', () => {
    describe('Offices', () => {
        const mockOffice = {
            id: 'off-1',
            city: { ar: 'الرياض', en: 'Riyadh' },
            address: { ar: 'طريق الملك فهد، برج العقيق', en: 'King Fahd Road, Al Aqeeq Tower' },
            mapUrl: 'https://maps.google.com/?q=24.7,46.6',
            mapX: 52,
            mapY: 48,
            image: { url: '/uploads/office-riyadh.jpg', width: 600, height: 400 },
            isHeadquarters: true,
            order: 0,
            isPublished: true,
        };

        it('maps office to Web correctly in Arabic', () => {
            const web = ReferenceMapper.officeToWeb(mockOffice, 'ar');
            expect(web.id).toBe('off-1');
            expect(web.city).toBe('الرياض');
            expect(web.address).toBe('طريق الملك فهد، برج العقيق');
            expect(web.isHeadquarters).toBe(true);
            expect(web.coordinates).toEqual({ x: 52, y: 48 });
        });

        it('maps office to Web correctly in English', () => {
            const web = ReferenceMapper.officeToWeb(mockOffice, 'en');
            expect(web.city).toBe('Riyadh');
            expect(web.address).toBe('King Fahd Road, Al Aqeeq Tower');
        });
    });

    describe('Testimonials', () => {
        const mockTestimonial = {
            id: 'test-1',
            quote: { ar: 'خدمات تدقيق متميزة ودقة متناهية', en: 'Outstanding audit services and precision' },
            rating: 5,
            name: { ar: 'سلطان القحطاني', en: 'Sultan Al-Qahtani' },
            role: { ar: 'المدير المالي', en: 'CFO' },
            company: { ar: 'مجموعة المدى القابضة', en: 'Mada Holding Group' },
            avatar: { url: '/uploads/sultan.jpg' },
            order: 0,
            isPublished: true,
            placement: ['home', 'services'],
        };

        it('maps testimonial to Web in Arabic', () => {
            const web = ReferenceMapper.testimonialToWeb(mockTestimonial, 'ar');
            expect(web.id).toBe('test-1');
            expect(web.name).toBe('سلطان القحطاني');
            expect(web.role).toBe('المدير المالي');
            expect(web.company).toBe('مجموعة المدى القابضة');
            expect(web.rating).toBe(5);
        });

        it('maps testimonial to Web in English', () => {
            const web = ReferenceMapper.testimonialToWeb(mockTestimonial, 'en');
            expect(web.name).toBe('Sultan Al-Qahtani');
            expect(web.role).toBe('CFO');
        });
    });

    describe('Client Logos & Credentials', () => {
        const mockLogo = {
            id: 'logo-1',
            name: 'Aramco',
            logo: { url: '/uploads/aramco.svg' },
            url: 'https://aramco.com',
            row: 1,
            order: 0,
            isPublished: true,
        };

        const mockCred = {
            id: 'cred-1',
            name: { ar: 'SOCPA معتمد', en: 'SOCPA Certified' },
            logo: { url: '/uploads/socpa.svg' },
            url: 'https://socpa.org.sa',
            order: 0,
            isPublished: true,
        };

        it('maps client logo to Web', () => {
            const web = ReferenceMapper.clientLogoToWeb(mockLogo);
            expect(web.id).toBe('logo-1');
            expect(web.name).toBe('Aramco');
            expect(web.image.src).toBe('/uploads/aramco.svg');
            expect(web.row).toBe(1);
        });

        it('maps credential to Web in Arabic', () => {
            const web = ReferenceMapper.credentialToWeb(mockCred, 'ar');
            expect(web.id).toBe('cred-1');
            expect(web.name).toBe('SOCPA معتمد');
        });
    });

    describe('FAQs', () => {
        const mockFaq = {
            id: 'faq-1',
            question: { ar: 'ما هي مواعيد تقديم الإقرارات؟', en: 'What are the return submission deadlines?' },
            answer: { ar: 'تقدم الإقرارات الضريبية شهرياً أو ربع سنوياً', en: 'Returns are submitted monthly or quarterly' },
            scope: 'global',
            order: 0,
            isPublished: true,
        };

        it('maps FAQ to Web in Arabic', () => {
            const web = ReferenceMapper.faqToWeb(mockFaq, 'ar');
            expect(web.id).toBe('faq-1');
            expect(web.question).toBe('ما هي مواعيد تقديم الإقرارات؟');
            expect(web.answer).toBe('تقدم الإقرارات الضريبية شهرياً أو ربع سنوياً');
        });
    });
});
