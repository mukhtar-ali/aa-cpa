import { getT } from '@/dictionaries/server';

export default async function HomePage() {
    const t = await getT();
    return (
        <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
            <h1 className="text-4xl font-bold tracking-tight">{t.footer.copyright}</h1>
            <p className="mt-4 opacity-70">Replace this page with your product&apos;s home page.</p>
        </div>
    );
}
