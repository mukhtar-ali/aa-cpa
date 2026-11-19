import { Module } from '@nestjs/common';
import { EmailModule } from '@/email/email.module';
import { SeoModule } from '@/seo/seo.module';
import { PageContentService } from './page-content.service';
import { SectionService } from './section.service';
import { SectionController } from './section.controller';
import { PageHeroController } from './page-hero.controller';
import { AdminSectionController } from './admin-section.controller';

@Module({
    imports: [EmailModule, SeoModule],
    providers: [SectionService, PageContentService],
    controllers: [SectionController, PageHeroController, AdminSectionController],
    exports: [SectionService, PageContentService],
})
export class SectionModule {}
