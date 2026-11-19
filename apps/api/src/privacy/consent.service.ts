import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '@/prisma/prisma.service';
import { customEnv } from '@/config/custom-env';

export interface RecordConsentInput {
    subjectType: 'contact' | 'application' | 'quote';
    subjectId: string;
    email: string;
    purpose: string;
    language: 'ar' | 'en';
    ip?: string;
    userAgent?: string;
    policyVersion?: string;
}

@Injectable()
export class ConsentService {
    constructor(private readonly prisma: PrismaService) {}

    hashIp(ip?: string | null): string {
        const pepper = customEnv.IP_HASH_PEPPER || customEnv.JWT_SECRET || 'default-pepper';
        const raw = `${ip || '0.0.0.0'}:${pepper}`;
        return crypto.createHash('sha256').update(raw).digest('hex');
    }

    hashEmail(email: string): string {
        const pepper = customEnv.IP_HASH_PEPPER || customEnv.JWT_SECRET || 'default-pepper';
        const raw = `${email.trim().toLowerCase()}:${pepper}`;
        return crypto.createHash('sha256').update(raw).digest('hex');
    }

    async getCurrentPolicyVersion(tx: any = this.prisma): Promise<string> {
        const section = await tx.section
            ?.findUnique({ where: { type: 'legal-privacy' } })
            .catch(() => null);
        const data = section?.data as { version?: string } | null | undefined;
        return data?.version ? String(data.version) : '1.0';
    }

    async recordConsent(input: RecordConsentInput, tx: any = this.prisma) {
        const policyVersion =
            input.policyVersion || (await this.getCurrentPolicyVersion(tx));
        const ipHash = this.hashIp(input.ip);
        const userAgent = (input.userAgent || 'unknown').slice(0, 255);

        return tx.consentRecord.create({
            data: {
                subjectType: input.subjectType,
                subjectId: input.subjectId,
                email: input.email.trim().toLowerCase(),
                purpose: input.purpose,
                policyVersion,
                language: input.language as any,
                ipHash,
                userAgent,
                consentedAt: new Date(),
            },
        });
    }
}
