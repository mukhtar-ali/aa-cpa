import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import {
    ClientLogoForm,
    ClientLogoFormSchema,
    CredentialForm,
    CredentialFormSchema,
    FaqItemForm,
    FaqItemFormSchema,
    OfficeForm,
    OfficeFormSchema,
    PermissionEnum,
    TestimonialForm,
    TestimonialFormSchema,
} from '@repo/shared';
import { ProtectedWithPermissions } from '@/auth/decorators/auth.decorator';
import { CustomZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { OfficesService } from './services/offices.service';
import { TestimonialsService } from './services/testimonials.service';
import { ClientLogosService } from './services/client-logos.service';
import { CredentialsService } from './services/credentials.service';
import { FaqsService } from './services/faqs.service';

@Controller('api/admin')
export class AdminReferenceController {
    constructor(
        private readonly officesService: OfficesService,
        private readonly testimonialsService: TestimonialsService,
        private readonly clientLogosService: ClientLogosService,
        private readonly credentialsService: CredentialsService,
        private readonly faqsService: FaqsService,
    ) {}

    // ==========================================
    // Offices
    // ==========================================
    @ProtectedWithPermissions(PermissionEnum.AdminPortalSiteContentView)
    @Get('offices')
    async getOffices() {
        return this.officesService.listAdmin();
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalSiteContentView)
    @Get('offices/:id')
    async getOfficeById(@Param('id') id: string) {
        return this.officesService.getByIdAdmin(id);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalSiteContentUpdate)
    @Post('offices')
    async createOffice(@Body(new CustomZodValidationPipe(OfficeFormSchema)) data: OfficeForm) {
        return this.officesService.create(data);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalSiteContentUpdate)
    @Put('offices/reorder')
    async reorderOffices(@Body() body: { items: Array<{ id: string; order: number }> }) {
        return this.officesService.reorder(body?.items || []);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalSiteContentUpdate)
    @Put('offices/:id')
    async updateOffice(
        @Param('id') id: string,
        @Body(new CustomZodValidationPipe(OfficeFormSchema)) data: OfficeForm,
    ) {
        return this.officesService.update(id, data);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalSiteContentUpdate)
    @Delete('offices/:id')
    async deleteOffice(@Param('id') id: string) {
        return this.officesService.delete(id);
    }

    // ==========================================
    // Testimonials
    // ==========================================
    @ProtectedWithPermissions(PermissionEnum.AdminPortalSiteContentView)
    @Get('testimonials')
    async getTestimonials() {
        return this.testimonialsService.listAdmin();
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalSiteContentView)
    @Get('testimonials/:id')
    async getTestimonialById(@Param('id') id: string) {
        return this.testimonialsService.getByIdAdmin(id);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalSiteContentUpdate)
    @Post('testimonials')
    async createTestimonial(@Body(new CustomZodValidationPipe(TestimonialFormSchema)) data: TestimonialForm) {
        return this.testimonialsService.create(data);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalSiteContentUpdate)
    @Put('testimonials/reorder')
    async reorderTestimonials(@Body() body: { items: Array<{ id: string; order: number }> }) {
        return this.testimonialsService.reorder(body?.items || []);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalSiteContentUpdate)
    @Put('testimonials/:id')
    async updateTestimonial(
        @Param('id') id: string,
        @Body(new CustomZodValidationPipe(TestimonialFormSchema)) data: TestimonialForm,
    ) {
        return this.testimonialsService.update(id, data);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalSiteContentUpdate)
    @Delete('testimonials/:id')
    async deleteTestimonial(@Param('id') id: string) {
        return this.testimonialsService.delete(id);
    }

    // ==========================================
    // Client Logos
    // ==========================================
    @ProtectedWithPermissions(PermissionEnum.AdminPortalSiteContentView)
    @Get('client-logos')
    async getClientLogos() {
        return this.clientLogosService.listAdmin();
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalSiteContentView)
    @Get('client-logos/:id')
    async getClientLogoById(@Param('id') id: string) {
        return this.clientLogosService.getByIdAdmin(id);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalSiteContentUpdate)
    @Post('client-logos')
    async createClientLogo(@Body(new CustomZodValidationPipe(ClientLogoFormSchema)) data: ClientLogoForm) {
        return this.clientLogosService.create(data);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalSiteContentUpdate)
    @Put('client-logos/reorder')
    async reorderClientLogos(@Body() body: { items: Array<{ id: string; order: number }> }) {
        return this.clientLogosService.reorder(body?.items || []);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalSiteContentUpdate)
    @Put('client-logos/:id')
    async updateClientLogo(
        @Param('id') id: string,
        @Body(new CustomZodValidationPipe(ClientLogoFormSchema)) data: ClientLogoForm,
    ) {
        return this.clientLogosService.update(id, data);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalSiteContentUpdate)
    @Delete('client-logos/:id')
    async deleteClientLogo(@Param('id') id: string) {
        return this.clientLogosService.delete(id);
    }

    // ==========================================
    // Credentials
    // ==========================================
    @ProtectedWithPermissions(PermissionEnum.AdminPortalSiteContentView)
    @Get('credentials')
    async getCredentials() {
        return this.credentialsService.listAdmin();
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalSiteContentView)
    @Get('credentials/:id')
    async getCredentialById(@Param('id') id: string) {
        return this.credentialsService.getByIdAdmin(id);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalSiteContentUpdate)
    @Post('credentials')
    async createCredential(@Body(new CustomZodValidationPipe(CredentialFormSchema)) data: CredentialForm) {
        return this.credentialsService.create(data);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalSiteContentUpdate)
    @Put('credentials/reorder')
    async reorderCredentials(@Body() body: { items: Array<{ id: string; order: number }> }) {
        return this.credentialsService.reorder(body?.items || []);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalSiteContentUpdate)
    @Put('credentials/:id')
    async updateCredential(
        @Param('id') id: string,
        @Body(new CustomZodValidationPipe(CredentialFormSchema)) data: CredentialForm,
    ) {
        return this.credentialsService.update(id, data);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalSiteContentUpdate)
    @Delete('credentials/:id')
    async deleteCredential(@Param('id') id: string) {
        return this.credentialsService.delete(id);
    }

    // ==========================================
    // FAQs
    // ==========================================
    @ProtectedWithPermissions(PermissionEnum.AdminPortalSiteContentView)
    @Get('faqs')
    async getFaqs(
        @Query('scope') scope?: string,
        @Query('serviceId') serviceId?: string,
    ) {
        return this.faqsService.listAdmin(scope, serviceId);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalSiteContentView)
    @Get('faqs/:id')
    async getFaqById(@Param('id') id: string) {
        return this.faqsService.getByIdAdmin(id);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalSiteContentUpdate)
    @Post('faqs')
    async createFaq(@Body(new CustomZodValidationPipe(FaqItemFormSchema)) data: FaqItemForm) {
        return this.faqsService.create(data);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalSiteContentUpdate)
    @Put('faqs/reorder')
    async reorderFaqs(@Body() body: { items: Array<{ id: string; order: number }> }) {
        return this.faqsService.reorder(body?.items || []);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalSiteContentUpdate)
    @Put('faqs/:id')
    async updateFaq(
        @Param('id') id: string,
        @Body(new CustomZodValidationPipe(FaqItemFormSchema)) data: FaqItemForm,
    ) {
        return this.faqsService.update(id, data);
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalSiteContentUpdate)
    @Delete('faqs/:id')
    async deleteFaq(@Param('id') id: string) {
        return this.faqsService.delete(id);
    }
}
