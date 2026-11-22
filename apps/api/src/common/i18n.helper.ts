import { I18nService } from 'nestjs-i18n';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export const langStorage = new AsyncLocalStorage<'en' | 'ar'>();

@Injectable()
export class I18nHelper implements OnModuleInit {
    private static instance: I18nService;

    constructor(private readonly i18n: I18nService) {}

    onModuleInit() {
        I18nHelper.instance = this.i18n;
    }

    static t(key: string, options?: Record<string, any>): string {
        const lang = langStorage.getStore() ?? 'en';
        return I18nHelper.instance.t(key, { ...options, lang }) as string;
    }
}

export const t = (key: string, options?: Record<string, any>): string =>
    I18nHelper.t(key, options);
