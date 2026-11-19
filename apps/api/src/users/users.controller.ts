import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { ProtectedWithPermissions } from '@/auth/decorators/auth.decorator';
import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBody, ApiQuery } from '@nestjs/swagger';
import {
    AddUserToAdminPortalModel, AddUserToAdminPortalSchema, AdminViewUserModel,
    CurrentUserModel, endpoint, PaginationParamsModel, PaginationParamsSchema,
    PermissionEnum, SetUserActiveModel, SetUserActiveSchema, UpdatePermissionsModel, UpdatePermissionsSchema,
} from '@repo/shared';
import { getZodDto } from '@/common/swagger/zod-dto';
import { UsersService } from './users.service';
import { AuthGuard } from '@/auth/guards/auth.guard';
import { CustomZodValidationPipe } from '@/common/pipes/zod-validation.pipe';

@Controller()
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @ApiBody({ type: getZodDto(AddUserToAdminPortalSchema) })
    @ProtectedWithPermissions(PermissionEnum.AdminPortalUsersCreate)
    @Post(endpoint.admin.createUser)
    async addUserToAdminPortal(
        @Body(new CustomZodValidationPipe(AddUserToAdminPortalSchema)) data: AddUserToAdminPortalModel,
    ) {
        await this.usersService.addUserToAdminPortal(data);
        return { message: 'User has been successfully added to the admin portal.' };
    }

    @ApiBody({ type: getZodDto(UpdatePermissionsSchema) })
    @ProtectedWithPermissions(PermissionEnum.PermissionsUpdate)
    @Post(endpoint.users.updatePermissions)
    async updatePermissions(
        @CurrentUser() currentUser: CurrentUserModel,
        @Body(new CustomZodValidationPipe(UpdatePermissionsSchema)) data: UpdatePermissionsModel,
    ) {
        if (currentUser.id === data.userId) throw new BadRequestException('You cannot update your own permissions.');
        await this.usersService.updatePermissions(currentUser.permissions, data.userId, data);
        return { message: 'Permissions updated successfully.' };
    }

    @ApiQuery({ type: getZodDto(PaginationParamsSchema) })
    @ProtectedWithPermissions(PermissionEnum.AdminPortalUsersView)
    @Get(endpoint.admin.listUsers)
    async getUsers(@Query(new CustomZodValidationPipe(PaginationParamsSchema)) query: PaginationParamsModel) {
        const data = await this.usersService.getUsers(query);
        const users: AdminViewUserModel[] = data.items.map((item) => ({
            id: item.id, fullName: item.fullName, email: item.email, username: item.username, isActive: item.isActive,
        }));
        return { items: users, totalCount: data.totalCount, pageNumber: data.pageNumber, pageSize: data.pageSize, totalPages: data.totalPages };
    }

    @ProtectedWithPermissions(PermissionEnum.AdminPortalUsersDelete)
    @Delete(endpoint.admin.deleteUser + '/:id')
    async deleteUser(@CurrentUser() currentUser: CurrentUserModel, @Param('id') id: string) {
        if (currentUser.id === id) throw new BadRequestException('You cannot delete your own account.');
        return await this.usersService.deleteUser(currentUser.permissions, id);
    }

    @ApiBody({ type: getZodDto(SetUserActiveSchema) })
    @ProtectedWithPermissions(PermissionEnum.AdminPortalUsersActivate)
    @Post(endpoint.admin.setUserActive + '/:id')
    async setUserActive(
        @CurrentUser() currentUser: CurrentUserModel,
        @Param('id') id: string,
        @Body(new CustomZodValidationPipe(SetUserActiveSchema)) data: SetUserActiveModel,
    ) {
        if (currentUser.id === id) throw new BadRequestException('You cannot change your own active status.');
        return await this.usersService.setActive(currentUser.permissions, id, data.isActive);
    }

    @ProtectedWithPermissions(PermissionEnum.PermissionsUpdate)
    @Get(endpoint.users.getPermissionsByUserId + '/:userId')
    async getPermissionsByUserId(@Param('userId') userId: string) {
        const permissions = await this.usersService.getPermissions(userId);
        return { permissions };
    }
}
