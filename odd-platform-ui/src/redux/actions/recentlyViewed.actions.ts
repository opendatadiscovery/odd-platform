import { createActionType } from 'redux/lib/helpers';

export const recentlyViewedActTypePrefix = 'recentlyViewed';

export const recordRecentlyViewedActType = createActionType(
  recentlyViewedActTypePrefix,
  'recordRecentlyViewed'
);
export const removeRecentlyViewedActType = createActionType(
  recentlyViewedActTypePrefix,
  'removeRecentlyViewed'
);
export const fetchRecentlyViewedListActType = createActionType(
  recentlyViewedActTypePrefix,
  'fetchRecentlyViewedList'
);
export const fetchRecentlyViewedStatusActType = createActionType(
  recentlyViewedActTypePrefix,
  'fetchRecentlyViewedStatus'
);
