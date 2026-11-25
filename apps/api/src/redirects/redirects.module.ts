import { Global, Module } from '@nestjs/common';
import { RedirectsController } from './redirects.controller';
import { RedirectsService } from './redirects.service';

@Global()
@Module({
    controllers: [RedirectsController],
    providers: [RedirectsService],
    exports: [RedirectsService],
})
export class RedirectsModule {}
