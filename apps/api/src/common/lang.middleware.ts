import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { langStorage } from './i18n.helper';

export type Lang = 'en' | 'ar';

/**
 * Picks the response language. An explicit `?lang=ar|en` wins (it is what server-rendered pages
 * pass in the URL, and unlike the header it survives any layer that drops headers); anything else
 * in `?lang=` (unknown values, arrays) is ignored. Otherwise the Accept-Language header decides,
 * and the default is Arabic (Arabic-first per R3).
 */
export function resolveLang(queryLang: unknown, acceptLanguage: string | undefined): Lang {
    if (typeof queryLang === 'string') {
        const explicit = queryLang.trim().toLowerCase();
        if (explicit === 'ar' || explicit === 'en') return explicit;
    }
    return acceptLanguage?.trim().toLowerCase().startsWith('en') ? 'en' : 'ar';
}

@Injectable()
export class LangMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const lang = resolveLang(req.query?.lang, req.headers['accept-language']);
        langStorage.run(lang, () => next());
    }
}
