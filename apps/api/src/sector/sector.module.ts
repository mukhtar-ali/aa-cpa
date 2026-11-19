import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { SectorController } from './sector.controller';
import { AdminSectorController } from './admin-sector.controller';
import { ListSectorsService } from './services/list-services.service';
import { GetSectorBySlugService } from './services/get-sector-by-slug.service';
import { CreateSectorService } from './services/create-sector.service';
import { UpdateSectorService } from './services/update-sector.service';
import { DeleteSectorService } from './services/delete-sector.service';
import { PublishSectorService } from './services/publish-sector.service';
import { ReorderSectorsService } from './services/reorder-sectors.service';

@Module({
    imports: [PrismaModule],
    controllers: [SectorController, AdminSectorController],
    providers: [
        ListSectorsService,
        GetSectorBySlugService,
        CreateSectorService,
        UpdateSectorService,
        DeleteSectorService,
        PublishSectorService,
        ReorderSectorsService,
    ],
    exports: [
        ListSectorsService,
        GetSectorBySlugService,
    ],
})
export class SectorModule {}
