import { notFound } from 'next/navigation';

// Any path nested deeper than the real routes ends here, so it gets the designed 404 inside the locale layout (header, footer,
// right language and direction) instead of Next's bare default page. Removed starter routes such as /projects/x/units/y land here.
export const dynamic = 'force-dynamic';

export default function UnknownPath() {
    notFound();
}
