import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { customEnv } from '@/config/custom-env';

export type PreviewKind = 'page' | 'service' | 'sector' | 'article' | 'job';

export interface PreviewTokenPayload {
    kind: PreviewKind;
    key: string;
    exp: number;
}

@Injectable()
export class PreviewService {
    private get secret(): string {
        return customEnv.PREVIEW_SECRET || customEnv.JWT_SECRET || 'dev-preview-secret';
    }

    private get webUrl(): string {
        return (customEnv.WEB_URL || 'http://localhost:3000').replace(/\/+$/, '');
    }

    issueToken(
        input: { kind: PreviewKind; key: string },
        expiresInSeconds = 900,
    ): { token: string; url: string; expiresAt: string } {
        const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
        const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString(
            'base64url',
        );
        const payloadObj: PreviewTokenPayload = {
            kind: input.kind,
            key: input.key,
            exp,
        };
        const payload = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
        const signature = crypto
            .createHmac('sha256', this.secret)
            .update(`${header}.${payload}`)
            .digest('base64url');

        const token = `${header}.${payload}.${signature}`;
        const url = `${this.webUrl}/api/preview?token=${encodeURIComponent(token)}&kind=${encodeURIComponent(input.kind)}&key=${encodeURIComponent(input.key)}`;

        return {
            token,
            url,
            expiresAt: new Date(exp * 1000).toISOString(),
        };
    }

    verifyToken(
        token?: string | null,
        expectedScope?: { kind: PreviewKind; key?: string },
    ): PreviewTokenPayload | null {
        if (!token || typeof token !== 'string') {
            return null;
        }

        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        const [header, payload, signature] = parts;
        const expectedSignature = crypto
            .createHmac('sha256', this.secret)
            .update(`${header}.${payload}`)
            .digest('base64url');

        if (signature.length !== expectedSignature.length) {
            return null;
        }

        const sigBuf = Buffer.from(signature);
        const expBuf = Buffer.from(expectedSignature);
        if (!crypto.timingSafeEqual(sigBuf, expBuf)) {
            return null;
        }

        try {
            const decoded = JSON.parse(
                Buffer.from(payload, 'base64url').toString('utf8'),
            ) as PreviewTokenPayload;

            const now = Math.floor(Date.now() / 1000);
            if (!decoded.exp || decoded.exp <= now) {
                return null;
            }

            if (expectedScope) {
                if (decoded.kind !== expectedScope.kind) {
                    return null;
                }
                if (
                    expectedScope.key &&
                    decoded.key !== '*' &&
                    decoded.key !== expectedScope.key
                ) {
                    return null;
                }
            }

            return decoded;
        } catch {
            return null;
        }
    }
}
