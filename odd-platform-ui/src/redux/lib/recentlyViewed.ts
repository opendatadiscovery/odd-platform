import type { RecentlyViewedAsset } from 'generated-sources';
import { assetRefKey } from 'redux/lib/favorites';

// The (kind, id) key helper is shared with Favorites — ids collide across kinds, so the kind is part
// of the key. Re-exported here so the recently-viewed slice/selectors have a single import surface.
export { assetRefKey };

/** The (kind, id) key of a resolved recently-viewed list item — the id comes from the populated per-kind ref. */
export const recentlyViewedAssetKey = (asset: RecentlyViewedAsset): string =>
  assetRefKey(
    asset.assetKind,
    asset.dataEntity?.id ?? asset.term?.id ?? asset.queryExample?.id ?? -1
  );
