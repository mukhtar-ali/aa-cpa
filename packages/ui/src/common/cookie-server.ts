'use server';
import { cookies } from 'next/headers';
import { CookieEnum } from './cookie.enum';

export const getCookieSSR = async (name: CookieEnum): Promise<string> => {
    const cookieStore = await cookies();
    return cookieStore.get(name)?.value || '';
};
