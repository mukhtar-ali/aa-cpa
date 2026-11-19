import { MultiLanguageFieldModel } from '../models';

export type Localized<T> = T extends MultiLanguageFieldModel
    ? string
    : T extends Array<infer U>
      ? Localized<U>[]
      : T extends object
        ? { [K in keyof T]: Localized<T[K]> }
        : T;
