import { HttpStatus, NotFoundException } from '@nestjs/common';
import { OgController } from './og.controller';
import { OgService } from './og.service';

describe('OgController', () => {
    let controller: OgController;
    let ogService: jest.Mocked<OgService>;

    beforeEach(() => {
        ogService = {
            render: jest.fn(),
        } as any;
        controller = new OgController(ogService);
    });

    it('returns 200 with PNG buffer, Content-Type, ETag, and Cache-Control headers', async () => {
        const fakeBuffer = Buffer.from('fake-png-data');
        const fakeHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

        ogService.render.mockResolvedValue({
            buffer: fakeBuffer,
            hash: fakeHash,
        });

        const headers: Record<string, string> = {};
        let statusSent: number | undefined;
        let bodySent: any;

        const res: any = {
            setHeader: jest.fn((k: string, v: string) => {
                headers[k.toLowerCase()] = v;
            }),
            status: jest.fn((s: number) => {
                statusSent = s;
                return res;
            }),
            send: jest.fn((b: any) => {
                bodySent = b;
                return res;
            }),
        };

        const req: any = { headers: {} };

        await controller.render({ type: 'page', key: 'home', lang: 'ar' }, req, res);

        expect(statusSent).toBe(HttpStatus.OK);
        expect(headers['content-type']).toBe('image/png');
        expect(headers['etag']).toBe(`"${fakeHash}"`);
        expect(headers['cache-control']).toBe('public, max-age=31536000, immutable');
        expect(bodySent).toBe(fakeBuffer);
    });

    it('returns 304 Not Modified when If-None-Match matches the ETag hash', async () => {
        const fakeBuffer = Buffer.from('fake-png-data');
        const fakeHash = 'abc123hash';

        ogService.render.mockResolvedValue({
            buffer: fakeBuffer,
            hash: fakeHash,
        });

        let statusSent: number | undefined;
        const res: any = {
            setHeader: jest.fn(),
            status: jest.fn((s: number) => {
                statusSent = s;
                return res;
            }),
            send: jest.fn(() => res),
        };

        const req: any = {
            headers: {
                'if-none-match': `"${fakeHash}"`,
            },
        };

        await controller.render({ type: 'page', key: 'about', lang: 'ar' }, req, res);

        expect(statusSent).toBe(HttpStatus.NOT_MODIFIED);
        expect(res.setHeader).not.toHaveBeenCalled();
    });

    it('propagates NotFoundException for unknown keys', async () => {
        ogService.render.mockRejectedValue(new NotFoundException('Unknown key'));

        const req: any = { headers: {} };
        const res: any = { setHeader: jest.fn(), status: jest.fn(), send: jest.fn() };

        await expect(
            controller.render({ type: 'page', key: 'does-not-exist', lang: 'ar' }, req, res),
        ).rejects.toThrow(NotFoundException);
    });
});
