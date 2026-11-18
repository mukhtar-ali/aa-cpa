export enum AnimateType {
    FadeIn = 'animate-fade-in',
    FadeUp = 'animate-fade-up',
    Line = 'animate-line',
    Word = 'animate-word',
    Word2 = 'animate-word-2',
    Word3 = 'animate-word-3',
    Image = 'animate-image',
    WordRandom = 'animate-word-random',
}
export const getAnimateGroup = (type: AnimateType) => `${type}-group`;

// Trimmed from ramy's original set — only page-scoped types with a corresponding page
// implemented here (see REMAINING_ISSUES.md for the pages not yet ported: About, Community,
// Investor Relations, Media, Contact, project/unit details). Add more as those pages land.
export enum AnimationType {
    SmoothScroll,
    Header,
    Footer,
    FadeUp,
    FadeIn,
    Line,
    Counter,
    Word,
    Word2,
    Word3,
    WordRandom,
    Image,
    HomePage,
}
