export enum ResponsiveFileType {
    Mobile = 'mobile',
    Desktop = 'desktop',
    Tablet = 'tablet',
}

export enum MediaType {
    Image = 'image',
    Video = 'video',
}

export enum SectionType {
    SiteChrome = 'site-chrome',
    PageHome = 'page-home',
    PageAbout = 'page-about',
    PageServices = 'page-services',
    ServiceShared = 'service-shared',
    PageSectors = 'page-sectors',
    PageArticles = 'page-articles',
    PageCareers = 'page-careers',
    PageContact = 'page-contact',
    LegalPrivacy = 'legal-privacy',
    LegalTerms = 'legal-terms',
    LegalAccessibility = 'legal-accessibility',
    EstimatorConfig = 'estimator-config',
    NotificationSettings = 'notification-settings',
    SpamSettings = 'spam-settings',

    // Legacy section types kept until Phase 4 cleanup
    WebsiteInfo = 'website-info',
    HomeHero = 'home-hero',
    HomeAbout = 'home-about',
    Fonts = 'fonts',
    homeWhy = 'home-why',
}

export const ALL_SECTION_TYPES = Object.values(SectionType);

export enum SeoPage {
    Home = 'home',
    About = 'about',
    Contact = 'contact',
    Projects = 'projects',
    News = 'news',
    Careers = 'careers',
}

/** Listing pages whose hero is edited in the admin (stored as the `<page>-hero` section). */
export enum ListingHeroPage {
    Projects = 'projects',
    News = 'news',
}

export enum SeoDynamicPage {
    Project = 'project',
}
