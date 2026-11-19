import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { EstimateRequestSchema } from '@repo/shared';
import { PrismaService } from '@/prisma/prisma.service';
import { localize } from '@/common/localize';
import { customEnv } from '@/config/custom-env';
import { LeadsService, RequestClientMeta } from '@/leads/leads.service';
import { calculateEstimate, DEFAULT_ESTIMATOR_CONFIG } from './calculator';

@Injectable()
export class EstimatorService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly leadsService: LeadsService,
    ) {}

    private str(val: unknown, lang: string, fallback = ''): string {
        if (!val) return fallback;
        if (typeof val === 'string') return val;
        const localized = localize(val, lang as any);
        return typeof localized === 'string' && localized.trim().length > 0
            ? localized
            : fallback;
    }

    private async getActiveConfig(): Promise<Record<string, any>> {
        const row = await this.prisma.section.findUnique({
            where: { type: 'estimator-config' },
        });
        const config = (row?.data as Record<string, any>) || DEFAULT_ESTIMATOR_CONFIG;
        const allowDraft = customEnv.ESTIMATOR_ALLOW_DRAFT === 'true';

        if (config.status !== 'approved' && !allowDraft) {
            throw new NotFoundException('Fee estimator is not published');
        }

        return config;
    }

    async getPublicConfig(lang: string) {
        const config = await this.getActiveConfig();

        const questions = Array.isArray(config.questions)
            ? config.questions.map((q: any) => ({
                  id: String(q.id),
                  title: this.str(q.title, lang),
                  ...(q.subtitle ? { subtitle: this.str(q.subtitle, lang) } : {}),
                  type: q.type || 'select',
                  options: Array.isArray(q.options)
                      ? q.options.map((opt: any) => ({
                            id: String(opt.id ?? opt.value),
                            label: this.str(opt.label, lang),
                            value: opt.value ?? opt.id,
                        }))
                      : [],
                  ...(q.min !== undefined ? { min: q.min } : {}),
                  ...(q.max !== undefined ? { max: q.max } : {}),
                  ...(q.step !== undefined ? { step: q.step } : {}),
                  ...(q.unit ? { unit: this.str(q.unit, lang) } : {}),
              }))
            : [];

        return {
            currency: config.currency || 'SAR',
            disclaimer: this.str(
                config.disclaimer,
                lang,
                DEFAULT_ESTIMATOR_CONFIG.disclaimer.ar,
            ),
            questions,
            ...(config.labels ? { labels: localize(config.labels, lang as any) } : {}),
        };
    }

    async computeEstimate(rawBody: unknown, lang: string) {
        const parsed = EstimateRequestSchema.safeParse(rawBody);
        if (!parsed.success) {
            throw new BadRequestException({
                message: 'Invalid estimate request',
                errors: parsed.error.issues,
            });
        }

        const config = await this.getActiveConfig();
        const result = calculateEstimate(config, parsed.data.answers);

        // Record anonymous completion event without inputs or PII (R10)
        await this.prisma.monitoringEvent
            ?.create({
                data: {
                    name: 'estimator.completed',
                    path: '/api/estimator/estimate',
                    props: { lang },
                },
            })
            .catch(() => null);

        return {
            min: result.min,
            max: result.max,
            currency: result.currency,
            disclaimer: this.str(
                config.disclaimer,
                lang,
                DEFAULT_ESTIMATOR_CONFIG.disclaimer.ar,
            ),
            isDraft: config.status !== 'approved',
        };
    }

    async submitQuote(rawBody: unknown, meta: RequestClientMeta = {}) {
        await this.getActiveConfig();
        return this.leadsService.submitQuote(rawBody, meta);
    }
}
