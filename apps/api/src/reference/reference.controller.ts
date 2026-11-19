import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '@/auth/decorators/public.decorator';
import { langStorage } from '@/common/i18n.helper';
import { OfficesService } from './services/offices.service';
import { TestimonialsService } from './services/testimonials.service';
import { ClientLogosService } from './services/client-logos.service';
import { CredentialsService } from './services/credentials.service';
import { FaqsService } from './services/faqs.service';

@Controller('api')
export class ReferenceController {
    constructor(
        private readonly officesService: OfficesService,
        private readonly testimonialsService: TestimonialsService,
        private readonly clientLogosService: ClientLogosService,
        private readonly credentialsService: CredentialsService,
        private readonly faqsService: FaqsService,
    ) {}

    @Public()
    @Get('offices')
    async getOffices(@Query('lang') queryLang?: string) {
        const lang = queryLang === 'en' || langStorage.getStore() === 'en' ? 'en' : 'ar';
        return this.officesService.listWeb(lang);
    }

    @Public()
    @Get('testimonials')
    async getTestimonials(
        @Query('lang') queryLang?: string,
        @Query('placement') placement?: string,
    ) {
        const lang = queryLang === 'en' || langStorage.getStore() === 'en' ? 'en' : 'ar';
        return this.testimonialsService.listWeb(lang, placement);
    }

    @Public()
    @Get('client-logos')
    async getClientLogos(@Query('row') row?: string) {
        const rowNum = row != null ? Number(row) : undefined;
        return this.clientLogosService.listWeb(rowNum);
    }

    @Public()
    @Get('credentials')
    async getCredentials(@Query('lang') queryLang?: string) {
        const lang = queryLang === 'en' || langStorage.getStore() === 'en' ? 'en' : 'ar';
        return this.credentialsService.listWeb(lang);
    }

    @Public()
    @Get('faqs')
    async getFaqs(
        @Query('lang') queryLang?: string,
        @Query('scope') scope?: string,
        @Query('serviceId') serviceId?: string,
    ) {
        const lang = queryLang === 'en' || langStorage.getStore() === 'en' ? 'en' : 'ar';
        return this.faqsService.listWeb(lang, scope, serviceId);
    }
}
