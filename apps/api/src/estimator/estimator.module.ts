import { Module } from '@nestjs/common';
import { LeadsModule } from '@/leads/leads.module';
import { PublicFormGuard } from '@/common/public-form.guard';
import { EstimatorController } from './estimator.controller';
import { EstimatorService } from './estimator.service';

@Module({
    imports: [LeadsModule],
    controllers: [EstimatorController],
    providers: [EstimatorService, PublicFormGuard],
    exports: [EstimatorService],
})
export class EstimatorModule {}
