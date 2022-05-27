import { ConfigurationParameters } from 'generated-sources';

export const BASE_PARAMS: ConfigurationParameters = {
  basePath: import.meta.env.VITE_API_URL || '',
  credentials: 'same-origin',
  headers: { 'Content-Type': 'application/json' },
};

// content width constants
export const toolbarHeight = 49;
export const maxSidebarWidth = 240;
export const maxContentWidth = 1216;
export const maxContentWidthWithoutSidebar = 1440;
export const maxTagsContainerWidth = 920;
export const maxIdentityFormContentWidth = '320px';

// main skeleton height constant
export const mainSkeletonHeight = '100%';

// tabs constants
export const primaryTabsHeight = 32;
export const tabsContainerMargin = 16;
