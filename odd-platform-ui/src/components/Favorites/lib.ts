import { AssetKind, type FavoriteAsset } from 'generated-sources';
import { dataEntityDetailsPath, queryExamplesPath, termDetailsPath } from 'routes';

/** The favorited asset's id, taken from whichever per-kind ref is populated. */
export const favoriteAssetId = (asset: FavoriteAsset): number =>
  asset.dataEntity?.id ?? asset.term?.id ?? asset.queryExample?.id ?? -1;

/** The display name for a favorited asset, per kind. */
export const favoriteAssetName = (asset: FavoriteAsset): string => {
  switch (asset.assetKind) {
    case AssetKind.DATA_ENTITY:
      return asset.dataEntity?.internalName || asset.dataEntity?.externalName || '';
    case AssetKind.TERM:
      return asset.term?.name || '';
    case AssetKind.QUERY_EXAMPLE:
      return (
        asset.queryExample?.definition ||
        (asset.queryExample?.id ? `Query Example #${asset.queryExample.id}` : '')
      );
    default:
      return '';
  }
};

/** The detail-page link for a favorited asset, or undefined when the kind has no routable view. */
export const favoriteAssetLink = (asset: FavoriteAsset): string | undefined => {
  switch (asset.assetKind) {
    case AssetKind.DATA_ENTITY:
      return asset.dataEntity?.id
        ? dataEntityDetailsPath(asset.dataEntity.id)
        : undefined;
    case AssetKind.TERM:
      return asset.term?.id ? termDetailsPath(asset.term.id) : undefined;
    case AssetKind.QUERY_EXAMPLE:
      return asset.queryExample?.id
        ? queryExamplesPath(asset.queryExample.id)
        : undefined;
    default:
      return undefined;
  }
};

/** The asset-type facet options, in display order. Labels are i18n keys (English == key). */
export const ASSET_KIND_OPTIONS: ReadonlyArray<{ kind: AssetKind; labelKey: string }> = [
  { kind: AssetKind.DATA_ENTITY, labelKey: 'Data Entities' },
  { kind: AssetKind.TERM, labelKey: 'Terms' },
  { kind: AssetKind.QUERY_EXAMPLE, labelKey: 'Query Examples' },
];

/** Singular kind label (i18n key) shown next to a favorited item in the mixed-kind list. */
export const assetKindSingularLabel: Record<AssetKind, string> = {
  [AssetKind.DATA_ENTITY]: 'Data Entity',
  [AssetKind.TERM]: 'Term',
  [AssetKind.QUERY_EXAMPLE]: 'Query Example',
};
