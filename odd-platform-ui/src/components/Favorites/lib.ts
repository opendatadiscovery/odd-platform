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

/**
 * The namespace shown on a favorited asset's rich row, when its per-kind ref carries one. Only
 * `TermRef` embeds a namespace today; `DataEntityRef` does not (the data-entity row's namespace /
 * datasource / created-at wait on the payload enrichment tracked for the API-contract slice), and a
 * Query Example has none by nature.
 */
export const favoriteAssetNamespace = (asset: FavoriteAsset): string | undefined =>
  asset.assetKind === AssetKind.TERM ? asset.term?.namespace?.name : undefined;

/** A short description/definition line for the rich row, per kind (undefined when the ref has none). */
export const favoriteAssetDescription = (asset: FavoriteAsset): string | undefined => {
  switch (asset.assetKind) {
    case AssetKind.TERM:
      return asset.term?.definition || undefined;
    case AssetKind.QUERY_EXAMPLE:
      return asset.queryExample?.query || undefined;
    default:
      return undefined;
  }
};

/** The last-updated timestamp shown on the Favorites table, when the ref carries one (Terms only today). */
export const favoriteAssetUpdatedAt = (asset: FavoriteAsset): Date | undefined =>
  asset.assetKind === AssetKind.TERM ? asset.term?.updatedAt : undefined;

/**
 * The Favorites tab's column grid (lg/md the same), summing to 12 — the same table approach the
 * catalog Search results use (`Search/Results/Results.styles`), with the columns favorites can fill:
 * Name (+ star) · Type · Namespace · Updated. Namespace/Updated are populated for the kinds whose ref
 * carries them (Terms today); the data-entity namespace/updated arrive with the payload-enrichment slice.
 */
export const FAVORITES_TABLE_COLS = { nm: 5, ty: 3, nd: 2.5, up: 1.5 } as const;

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
