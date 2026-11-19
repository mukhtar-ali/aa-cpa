import { z } from 'zod';
import {
    NotificationSettingsSchema,
    SpamSettingsSchema,
} from '../validations/settings.schema';

export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>;
export type SpamSettings = z.infer<typeof SpamSettingsSchema>;
