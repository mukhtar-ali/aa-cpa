import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { localize } from './localize';
import { langStorage } from './i18n.helper';

@Injectable()
export class LocaleInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const stored = langStorage.getStore();
        const lang: 'en' | 'ar' = stored === 'en' ? 'en' : 'ar';
        return next.handle().pipe(
            map((data) => (data && typeof data === 'object' ? localize(data, lang) : data)),
        );
    }
}
