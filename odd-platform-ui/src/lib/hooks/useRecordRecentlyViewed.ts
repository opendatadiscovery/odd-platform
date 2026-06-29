import React from 'react';
import type { AssetKind } from 'generated-sources';
import { useAppDispatch } from 'redux/lib/hooks';
import { recordRecentlyViewed } from 'redux/thunks';

/**
 * Records the opened asset in the current user's Recently Viewed history (#1816). Fires once when a detail
 * page mounts with a resolved id, and again when the id changes (navigating between assets). A deliberate
 * signal — never a side effect of the asset GET — deduped server-side (move-to-top UPSERT); fire-and-forget,
 * so it never gates the page render. Under `auth.type=DISABLED` the write lands in the shared instance bucket.
 */
const useRecordRecentlyViewed = (
  assetKind: AssetKind,
  assetId: number | undefined
): void => {
  const dispatch = useAppDispatch();
  React.useEffect(() => {
    if (assetId === undefined || assetId === null || Number.isNaN(Number(assetId)))
      return;
    dispatch(recordRecentlyViewed({ assetKind, assetId }));
  }, [dispatch, assetKind, assetId]);
};

export default useRecordRecentlyViewed;
