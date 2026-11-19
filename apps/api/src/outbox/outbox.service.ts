import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { enqueueRevalidate } from './revalidate';

export interface EnqueueEmailInput {
    template: string;
    to: string;
    language: 'ar' | 'en';
    payload: Record<string, any>;
}

@Injectable()
export class OutboxService {
    constructor(private readonly prisma: PrismaService) {}

    async enqueueEmail(input: EnqueueEmailInput, tx: any = this.prisma) {
        return tx.emailOutbox.create({
            data: {
                kind: 'email',
                template: input.template,
                to: input.to,
                language: input.language as any,
                payload: input.payload,
                status: 'pending',
                attempts: 0,
                nextAttemptAt: new Date(),
            },
        });
    }

    async enqueueRevalidate(tags: string[], tx: any = this.prisma) {
        await enqueueRevalidate(tx, tags);
    }

    async listAdmin(status?: string) {
        const where: any = status ? { status } : {};
        return this.prisma.emailOutbox.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }

    async retry(id: string) {
        const row = await this.prisma.emailOutbox.findUnique({ where: { id } });
        if (!row) {
            throw new NotFoundException(`Outbox row not found: ${id}`);
        }

        return this.prisma.emailOutbox.update({
            where: { id },
            data: {
                status: 'pending',
                attempts: 0,
                nextAttemptAt: new Date(),
                lastError: null,
            },
        });
    }
}
