import { Controller, Get, HttpStatus, Query, Req, Res } from '@nestjs/common';
import { OgQueryModel, OgQuerySchema } from '@repo/shared';
import { Public } from '@/auth/decorators/public.decorator';
import { CustomZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { OgService } from './og.service';

@Controller()
export class OgController {
    constructor(private readonly ogService: OgService) {}

    /**
     * Renders a 1200x630 OpenGraph PNG for pages, services, articles, and jobs.
     * Caches by content hash on disk.
     * Responses include ETag and Cache-Control: public, max-age=31536000, immutable.
     */
    @Public()
    @Get('/api/og')
    async render(
        @Query(new CustomZodValidationPipe(OgQuerySchema)) query: OgQueryModel,
        @Req() req: any,
        @Res() res: any,
    ) {
        const { buffer, hash } = await this.ogService.render(query);

        const clientETag = req.headers?.['if-none-match'];
        if (clientETag === hash || clientETag === `"${hash}"` || clientETag === `W/"${hash}"`) {
            return res.status(HttpStatus.NOT_MODIFIED).send();
        }

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('ETag', `"${hash}"`);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return res.status(HttpStatus.OK).send(buffer);
    }
}
