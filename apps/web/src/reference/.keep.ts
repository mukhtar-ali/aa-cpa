// Type-only import verification for feature 001-design-system (T019)
// Will be deleted in T104 when mock reference content lands.
import type { SiteChrome, ServiceSummary, ImageRef } from '@repo/design-system/types';

export type KeepRef = {
  chrome?: SiteChrome;
  service?: ServiceSummary;
  image?: ImageRef;
};
