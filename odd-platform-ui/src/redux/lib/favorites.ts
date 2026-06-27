import type { AssetKind, FavoriteAsset } from 'generated-sources';

/** Stable per-asset key for the favorited-status map. Ids collide across kinds, so the kind is part of the key. */
export const assetRefKey = (assetKind: AssetKind | string, assetId: number): string =>
  `${assetKind}:${assetId}`;

/** The (kind, id) key of a resolved favorite list item — the id comes from the populated per-kind ref. */
export const favoriteAssetKey = (asset: FavoriteAsset): string =>
  assetRefKey(
    asset.assetKind,
    asset.dataEntity?.id ?? asset.term?.id ?? asset.queryExample?.id ?? -1
  );
