import { describe, expect, it } from 'vitest';
import { AssetKind, type FavoriteAsset } from 'generated-sources';
import {
  favoriteAssetDescription,
  favoriteAssetName,
  favoriteAssetNamespace,
} from '../lib';

/**
 * The per-kind field resolution behind the Favorites tab's rich rows (#1815 / PRD-0002 A5). The
 * favorites payload embeds the full per-kind ref, so the row resolves namespace + description live,
 * degrading where a kind has none — a Query Example has no namespace, a Data Entity ref carries no
 * description (its namespace/created-at await the payload-enrichment slice).
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
  it('namespace: present for a Term, absent for a Query Example and a Data Entity', () => {
    expect(favoriteAssetNamespace(termAsset)).toBe('Marketing');
    expect(favoriteAssetNamespace(queryExampleAsset)).toBeUndefined();
    expect(favoriteAssetNamespace(dataEntityAsset)).toBeUndefined();
  });

  it('description: a Term definition, a Query Example query, nothing for a Data Entity', () => {
    expect(favoriteAssetDescription(termAsset)).toBe(
      'A customer who stopped using the product.'
    );
    expect(favoriteAssetDescription(queryExampleAsset)).toBe(
      'SELECT * FROM users WHERE active'
    );
    expect(favoriteAssetDescription(dataEntityAsset)).toBeUndefined();
  });

  it('name: the existing per-kind resolution still holds (QE falls back to its definition)', () => {
    expect(favoriteAssetName(termAsset)).toBe('Churn');
    expect(favoriteAssetName(queryExampleAsset)).toBe('Active users last 30 days');
    expect(favoriteAssetName(dataEntityAsset)).toBe('orders');
  });
});
