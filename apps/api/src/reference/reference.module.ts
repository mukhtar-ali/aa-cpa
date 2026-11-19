import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { ReferenceController } from './reference.controller';
import { AdminReferenceController } from './admin-reference.controller';
import { OfficesService } from './services/offices.service';
import { TestimonialsService } from './services/testimonials.service';
import { ClientLogosService } from './services/client-logos.service';
import { CredentialsService } from './services/credentials.service';
import { FaqsService } from './services/faqs.service';

@Module({
    imports: [PrismaModule],
    controllers: [ReferenceController, AdminReferenceController],
    providers: [
        OfficesService,
        TestimonialsService,
        ClientLogosService,
        CredentialsService,
        FaqsService,
    ],
    exports: [
        OfficesService,
        TestimonialsService,
        ClientLogosService,
        CredentialsService,
        FaqsService,
    ],
})
export class ReferenceModule {}
