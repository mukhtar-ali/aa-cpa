import { v4 as uuidv4 } from 'uuid';

export const createUniqueFilename = (filename: string): string => {
    return `${uuidv4()}-${filename}`;
};

export const createRandomPassword = (length: number = 8): string => {
    const passwordLength = Math.max(length, 4);
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '@$!%*?&';
    const allChars = lowercase + uppercase + numbers + special;
    const requiredChars = [
        lowercase.charAt(Math.floor(Math.random() * lowercase.length)),
        uppercase.charAt(Math.floor(Math.random() * uppercase.length)),
        numbers.charAt(Math.floor(Math.random() * numbers.length)),
        special.charAt(Math.floor(Math.random() * special.length)),
    ];
    const passwordChars = [...requiredChars];
    for (let i = requiredChars.length; i < passwordLength; i++) {
        passwordChars.push(allChars.charAt(Math.floor(Math.random() * allChars.length)));
    }
    for (let i = passwordChars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = passwordChars[i]!;
        passwordChars[i] = passwordChars[j]!;
        passwordChars[j] = temp;
    }
    return passwordChars.join('');
};

export const createUniqueSlug = (text: string): string => {
    return text
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

export const createUsername = (name: string): string => {
    const id = Math.floor(Math.random() * 10000);
    const cleanName = name
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^\w_]/g, '');
    const maxLength = 100 - id.toString().length;
    return `${cleanName.slice(0, maxLength)}_${id}`;
};

export const createRandomOtp = (length: number = 6): string => {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return otp;
};

export const getFileNameFromUrl = (url: string): string => {
    return new URL(url).pathname.split('/').pop() || 'No file name';
};

export const createNewUuid = (): string => uuidv4();
