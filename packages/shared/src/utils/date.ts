import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import dayjs, { Dayjs } from 'dayjs';

dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

export const getDayjs = () => dayjs;

export const toUtcDate = (date: Date | Dayjs): Date => {
    return dayjs(date).utc().startOf('day').toDate();
};

export const toUtcDateTime = (date: Date | Dayjs): Date => {
    return dayjs(date).utc().toDate();
};

export const toCairoDate = (date: Date): Dayjs => {
    return dayjs(date).tz('Africa/Cairo').startOf('day');
};

export const toCairoDateTime = (date: Date): Dayjs => {
    return dayjs(date).tz('Africa/Cairo');
};
