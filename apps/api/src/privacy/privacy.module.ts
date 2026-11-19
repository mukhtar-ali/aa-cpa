import { Global, Module } from '@nestjs/common';
import { ResourceModule } from '@/resource/resource.module';
import { ConsentService } from './consent.service';
import { PrivacyService } from './privacy.service';
import { PrivacyController } from './privacy.controller';

@Global()
@Module({
    imports: [ResourceModule],
    controllers: [PrivacyController],
    providers: [ConsentService, PrivacyService],
    exports: [ConsentService, PrivacyService],
})
export class PrivacyModule {}
