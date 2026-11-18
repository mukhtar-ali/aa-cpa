import { Module } from '@nestjs/common';
import { UnitesController } from './unites.controller';
import { CreateUnitService } from './services/create-unit.service';
import { UpdateUnitService } from './services/update-unit.service';
import { GetAllUnitsService } from './services/get-all-units.service';
import { GetUnitByIdService } from './services/get-unit-by-id.service';
import { GetUnitBySlugService } from './services/get-unit-by-slug.service';
import { DeleteUnitService } from './services/delete-unit.service';

@Module({
    controllers: [UnitesController],
    providers: [
        CreateUnitService, UpdateUnitService, GetAllUnitsService,
        GetUnitByIdService, GetUnitBySlugService, DeleteUnitService,
    ],
    exports: [
        CreateUnitService, UpdateUnitService, GetAllUnitsService,
        GetUnitByIdService, GetUnitBySlugService, DeleteUnitService,
    ],
})
export class UnitesModule {}
