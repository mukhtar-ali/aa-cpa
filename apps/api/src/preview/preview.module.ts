import { Global, Module } from '@nestjs/common';
import { PreviewController } from './preview.controller';
import { PreviewService } from './preview.service';

@Global()
@Module({
    controllers: [PreviewController],
    providers: [PreviewService],
    exports: [PreviewService],
})
export class PreviewModule {}
