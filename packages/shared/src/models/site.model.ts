import { z } from 'zod';
import {
    NavItemSchema,
    SocialLinkSchema,
    ContactChannelSchema,
    FooterColumnSchema,
    SiteChromeWebSchema,
    SiteChromeSectionSchema,
} from '../validations/site.schema';

export type NavItem = z.infer<typeof NavItemSchema>;
export type SocialLink = z.infer<typeof SocialLinkSchema>;
export type ContactChannel = z.infer<typeof ContactChannelSchema>;
export type FooterColumn = z.infer<typeof FooterColumnSchema>;
export type SiteChromeWeb = z.infer<typeof SiteChromeWebSchema>;
export type SiteChromeSection = z.infer<typeof SiteChromeSectionSchema>;
