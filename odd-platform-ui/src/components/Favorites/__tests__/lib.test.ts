import { describe, expect, it } from 'vitest';
import { AssetKind, type FavoriteAsset } from 'generated-sources';
import { favoriteAssetName } from '../lib';

/**
 * The per-kind NAME resolution used wherever a favorited asset is rendered — the Catalog Overview
 * Favorites panel, the search result rows, and Recently Viewed.
 *
 * ST-7 (#1841) retired the Favorites tab, and with it the only consumers of `favoriteAssetNamespace`,
 * `favoriteAssetDescription`, `favoriteAssetUpdatedAt` and `FAVORITES_TABLE_COLS` (the tab's rich-row
 * columns). Those helpers were deleted with the tab, so their cases here went with them: the subject no
 * longer exists, which is the only legitimate reason to drop a test. `favoriteAssetName` has live
 * consumers and keeps its coverage.
 */

const termAsset = {
  assetKind: AssetKind.TERM,
  term: {
    id: 7,
    name: 'Churn',
    definition: 'A customer who stopped using the product.',
    namespace: { id: 1, name: 'Marketing' },
  },
} as unknown as FavoriteAsset;

const queryExampleAsset = {
  assetKind: AssetKind.QUERY_EXAMPLE,
  queryExample: {
    id: 9,
    definition: 'Active users last 30 days',
    query: 'SELECT * FROM users WHERE active',
  },
} as unknown as FavoriteAsset;

const dataEntityAsset = {
  assetKind: AssetKind.DATA_ENTITY,
  dataEntity: { id: 3, internalName: 'orders', externalName: 'public.orders' },
} as unknown as FavoriteAsset;

describe('favorites/lib per-kind field resolution', () => {
  it('name: the existing per-kind resolution still holds (QE falls back to its definition)', () => {
    expect(favoriteAssetName(termAsset)).toBe('Churn');
    expect(favoriteAssetName(queryExampleAsset)).toBe('Active users last 30 days');
    expect(favoriteAssetName(dataEntityAsset)).toBe('orders');
  });
});
