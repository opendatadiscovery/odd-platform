import { ConfigurationParameters } from 'generated-sources';

export const BASE_PARAMS: ConfigurationParameters = {
  basePath: process.env.REACT_APP_API_URL || '',
  credentials: 'same-origin',
  headers: { 'Content-Type': 'application/json' },
};

// content width constants
export const toolbarHeight = 49;
export const maxSidebarWidth = 240;
export const maxContentWidth = 1216;
export const maxContentWidthWithoutSidebar = 1440;

// main skeleton height constant
export const mainSkeletonHeight = '100%';

// tabs height
export const primaryTabsHeight = 32;
