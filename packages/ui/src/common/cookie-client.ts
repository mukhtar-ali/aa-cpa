import Cookies from 'js-cookie';
import { CookieEnum } from './cookie.enum';

export const setCookie = (name: CookieEnum, value: string): void => {
    Cookies.set(name, value, { expires: 356, path: '/' });
};

export const getCookie = (name: CookieEnum): string | undefined => {
    return Cookies.get(name);
};

export const deleteCookie = (name: CookieEnum): void => {
    Cookies.remove(name);
};
