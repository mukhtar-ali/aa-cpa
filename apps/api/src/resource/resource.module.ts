import { Module } from '@nestjs/common';
import { LocalFilesController } from './local-files.controller';
import { ResourceController } from './resource.controller';
import { ResourceService } from './resource.service';

@Module({
    controllers: [ResourceController, LocalFilesController],
    providers: [ResourceService],
    exports: [ResourceService],
})
export class ResourceModule {}
