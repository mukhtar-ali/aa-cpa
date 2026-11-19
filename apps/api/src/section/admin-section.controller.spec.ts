import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { PermissionEnum, SectionType } from '@repo/shared';
import { AdminSectionController } from './admin-section.controller';
import { SectionService } from './section.service';

describe('AdminSectionController', () => {
    let controller: AdminSectionController;
    let sectionService: jest.Mocked<SectionService>;

    beforeEach(() => {
        sectionService = {
            getSection: jest.fn(),
            updateSection: jest.fn(),
        } as unknown as jest.Mocked<SectionService>;

        controller = new AdminSectionController(sectionService);
    });

    describe('getSection', () => {
        it('delegates to sectionService.getSection', async () => {
            sectionService.getSection.mockResolvedValue({ some: 'data' });
            const res = await controller.getSection(SectionType.SpamSettings);
            expect(res).toEqual({ some: 'data' });
            expect(sectionService.getSection).toHaveBeenCalledWith(SectionType.SpamSettings);
        });
    });

    describe('updateSection', () => {
        it('throws ForbiddenException if user lacks permission for the type', async () => {
            const req = { user: { permissions: [PermissionEnum.AdminPortalSiteContentView] } };
            await expect(
                controller.updateSection(SectionType.SpamSettings, {}, req),
            ).rejects.toThrow(ForbiddenException);
        });

        it('throws BadRequestException if body fails Zod schema validation', async () => {
            const req = {
                user: { permissions: [PermissionEnum.AdminPortalSettingsNotifications] },
            };
            const invalidBody = { turnstileEnabled: 'invalid' };
            await expect(
                controller.updateSection(SectionType.SpamSettings, invalidBody, req),
            ).rejects.toThrow(BadRequestException);
        });

        it('validates and updates section when payload and permissions are valid', async () => {
            const req = {
                user: { permissions: [PermissionEnum.AdminPortalSettingsNotifications] },
            };
            const validBody = {
                turnstileEnabled: true,
                turnstileSiteKey: '0x4AAAA',
                minFillSeconds: 5,
            };
            sectionService.updateSection.mockResolvedValue({ id: '1' } as any);

            const res = await controller.updateSection(SectionType.SpamSettings, validBody, req);
            expect(res).toEqual({ id: '1' });
            expect(sectionService.updateSection).toHaveBeenCalledWith(
                SectionType.SpamSettings,
                validBody,
            );
        });
    });
});
