import { FC, ReactNode } from 'react';
import type { WebsiteInfoSectionModelWeb } from '@repo/shared';
import type { HeaderProject } from '@/src/lib/server-data';
import { CustomHeader } from './CustomHeader';
import { CustomFooter } from './CustomFooter';

interface Props {
    children: ReactNode;
    websiteInfo?: WebsiteInfoSectionModelWeb | null;
    projects?: HeaderProject[];
}

export const WebLayout: FC<Props> = ({ children, websiteInfo, projects }) => {
    return (
        <>
            <CustomHeader projects={projects} />
            <main className="min-h-[60vh]">{children}</main>
            <CustomFooter info={websiteInfo} />
        </>
    );
};
