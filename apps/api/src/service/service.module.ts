import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { ServiceController } from './service.controller';
import { AdminServiceController } from './admin-service.controller';
import { ListServicesService } from './services/list-services.service';
import { GetServiceBySlugService } from './services/get-service-by-slug.service';
import { CreateServiceService } from './services/create-service.service';
import { UpdateServiceService } from './services/update-service.service';
import { DeleteServiceService } from './services/delete-service.service';
import { PublishServiceService } from './services/publish-service.service';
import { ReorderServicesService } from './services/reorder-services.service';

@Module({
    imports: [PrismaModule],
    controllers: [ServiceController, AdminServiceController],
    providers: [
        ListServicesService,
        GetServiceBySlugService,
        CreateServiceService,
        UpdateServiceService,
        DeleteServiceService,
        PublishServiceService,
        ReorderServicesService,
    ],
    exports: [
        ListServicesService,
        GetServiceBySlugService,
    ],
})
export class ServiceModule {}
