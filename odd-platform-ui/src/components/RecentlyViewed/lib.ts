import type { RecentlyViewedAsset } from 'generated-sources';
import {
  favoriteAssetId,
  favoriteAssetLink,
  favoriteAssetName,
} from 'components/Favorites/lib';

// A recently-viewed list item shares FavoriteAsset's polymorphic shape (the per-kind refs), so the
// link / name / id derivation is reused 1:1 from the Favorites lib rather than duplicated —
// RecentlyViewedAsset is structurally assignable to those helpers' parameter.
export const recentlyViewedAssetId = (asset: RecentlyViewedAsset): number =>
  favoriteAssetId(asset);

export const recentlyViewedAssetName = (asset: RecentlyViewedAsset): string =>
  favoriteAssetName(asset);

export const recentlyViewedAssetLink = (asset: RecentlyViewedAsset): string | undefined =>
  favoriteAssetLink(asset);
