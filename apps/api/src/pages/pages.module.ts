import { Module } from '@nestjs/common';
import { SectionModule } from '@/section/section.module';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';

@Module({
    imports: [SectionModule],
    controllers: [PagesController],
    providers: [PagesService],
    exports: [PagesService],
})
export class PagesModule {}
