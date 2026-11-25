import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { OgController } from './og.controller';
import { OgService } from './og.service';

@Module({
    imports: [PrismaModule],
    controllers: [OgController],
    providers: [OgService],
    exports: [OgService],
})
export class OgModule {}
