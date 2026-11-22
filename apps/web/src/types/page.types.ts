export type SlugPageProps = {
    params: Promise<{ slug: string }>;
};

export type SlugPageWithSearchProps = SlugPageProps & {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
};
