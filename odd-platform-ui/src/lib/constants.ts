import { ConfigurationParameters, DataQualityTestSeverity } from 'generated-sources';

export const BASE_PARAMS: ConfigurationParameters = {
  basePath: import.meta.env.VITE_API_URL || '',
  credentials: 'same-origin',
  headers: { 'Content-Type': 'application/json' },
};

export const ORDERED_SEVERITY = [
  DataQualityTestSeverity.CRITICAL,
  DataQualityTestSeverity.MAJOR,
  DataQualityTestSeverity.MINOR,
];

// content width constants
export const toolbarHeight = 49;
export const maxSidebarWidth = 240;
export const activitySidebarWidth = 192;
export const maxContentWidth = 1216;
export const maxContentWidthWithoutSidebar = 1440;
export const maxTagsContainerWidth = 920;
export const maxIdentityFormContentWidth = '320px';

// main skeleton height constant
export const mainSkeletonHeight = '100%';

// tabs constants
export const primaryTabsHeight = 32;
export const tabsContainerMargin = 16;

// time formats
export const alertDateFormat = 'd MMM yyyy, HH:mm';

// empty structures
export const emptyArr = [];
export const emptyObj = {};
