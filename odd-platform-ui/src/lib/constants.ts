import { ConfigurationParameters } from 'generated-sources';

export const BASE_PARAMS: ConfigurationParameters = {
  basePath: process.env.REACT_APP_API_URL || '',
  credentials: 'same-origin',
  headers: { 'Content-Type': 'application/json' },
};

// content width constants
export const toolbarHeight = 49;
export const maxSidebarWidth = 224;
export const maxContentWidth = 1216;
export const maxContentWidthWithoutSidebar = 1440;
