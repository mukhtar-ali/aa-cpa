import { Module } from '@nestjs/common';
import { PrivacyModule } from '@/privacy/privacy.module';
import { OutboxModule } from '@/outbox/outbox.module';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { PublicFormGuard } from '@/common/public-form.guard';

@Module({
    imports: [PrivacyModule, OutboxModule],
    controllers: [LeadsController],
    providers: [LeadsService, PublicFormGuard],
    exports: [LeadsService],
})
export class LeadsModule {}
