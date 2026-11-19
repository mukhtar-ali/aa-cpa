import { Global, Module } from '@nestjs/common';
import { RedirectsService } from './redirects.service';

@Global()
@Module({
    providers: [RedirectsService],
    exports: [RedirectsService],
})
export class RedirectsModule {}
