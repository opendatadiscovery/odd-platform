import { describe, expect, it, vi } from 'vitest';
import { AssetKind, type FavoriteAsset } from 'generated-sources';
import reducer, { initialState } from 'redux/slices/favorites.slice';
import {
  addFavorite,
  removeFavorite,
  fetchFavoritesList,
  fetchFavoritesStatus,
} from 'redux/thunks/favorites.thunks';
import { assetRefKey } from 'redux/lib/favorites';

/**
 * Favorites slice (odd-platform#1815, CTRIB-039 S3). The load-bearing behaviour is the BATCH-HYDRATE
 * reducer for `fetchFavoritesStatus`: a list resolves every visible row in one call. The status
 * endpoint returns only the FAVORITED subset, so the slice must mark the asked-but-not-favorited refs
 * `false` (not leave them `undefined`, which would make each row re-query) WITHOUT clobbering a value
 * the user just toggled optimistically. The reducer is exercised via the real thunk action creators.
 */

// vi.mock is hoisted above the imports. The thunks barrel pulls every api client at import; replace
// the whole module so any `import { xApi }` resolves to an inert object (no client construction).
vi.mock('lib/api', () => {
  const handler = { get: (_t: object, p: string) => (p === '__esModule' ? true : {}) };
  return new Proxy({ __esModule: true }, handler);
});
vi.mock('lib/errorHandling', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, showSuccessToast: vi.fn(), showServerErrorToast: vi.fn() };
});

const ref = (kind: AssetKind, assetId: number) => ({ assetKind: kind, assetId });
const deRef = (id: number): FavoriteAsset =>
  ({ assetKind: AssetKind.DATA_ENTITY, dataEntity: { id } }) as unknown as FavoriteAsset;
const termRef = (id: number): FavoriteAsset =>
  ({ assetKind: AssetKind.TERM, term: { id } }) as unknown as FavoriteAsset;

describe('favorites slice', () => {
  it('addFavorite marks the asset favorited', () => {
    const key = assetRefKey(AssetKind.DATA_ENTITY, 1);
    const next = reducer(
      initialState,
      addFavorite.fulfilled({ key }, 'r', ref(AssetKind.DATA_ENTITY, 1))
    );
    expect(next.favoritedByKey[key]).toBe(true);
  });

  it('removeFavorite marks the asset unfavorited AND drops it from the list', () => {
    const key = assetRefKey(AssetKind.TERM, 5);
    const start = {
      ...initialState,
      favoritedByKey: { [key]: true },
      list: [termRef(5)],
    };
    const next = reducer(
      start,
      removeFavorite.fulfilled({ key }, 'r', ref(AssetKind.TERM, 5))
    );
    expect(next.favoritedByKey[key]).toBe(false);
    expect(next.list).toHaveLength(0);
  });

  describe('fetchFavoritesStatus batch hydrate', () => {
    const A = ref(AssetKind.DATA_ENTITY, 1); // favorited
    const B = ref(AssetKind.DATA_ENTITY, 2); // asked, not favorited, but locally optimistic-true
    const C = ref(AssetKind.TERM, 3); // asked, not favorited, previously unknown

    it('resolves asked-but-not-favorited refs to false (so rows do not re-query)', () => {
      const next = reducer(
        initialState,
        fetchFavoritesStatus.fulfilled({ asked: [A, C], favorited: [A] }, 'r', {
          assetRef: [A, C],
        })
      );
      expect(next.favoritedByKey[assetRefKey(AssetKind.DATA_ENTITY, 1)]).toBe(true);
      expect(next.favoritedByKey[assetRefKey(AssetKind.TERM, 3)]).toBe(false);
    });

    it('never clobbers a value the user just toggled (fill-unknowns only)', () => {
      const start = {
        ...initialState,
        favoritedByKey: { [assetRefKey(AssetKind.DATA_ENTITY, 2)]: true },
      };
      // Server reply does not include B (it was favorited locally after this request was sent).
      const next = reducer(
        start,
        fetchFavoritesStatus.fulfilled({ asked: [A, B, C], favorited: [A] }, 'r', {
          assetRef: [A, B, C],
        })
      );
      // B stays true — the in-flight hydrate must not undo the optimistic star.
      expect(next.favoritedByKey[assetRefKey(AssetKind.DATA_ENTITY, 2)]).toBe(true);
      expect(next.favoritedByKey[assetRefKey(AssetKind.DATA_ENTITY, 1)]).toBe(true);
      expect(next.favoritedByKey[assetRefKey(AssetKind.TERM, 3)]).toBe(false);
    });
  });

  describe('fetchFavoritesList', () => {
    it('page 1 replaces the list and marks every item favorited', () => {
      const next = reducer(
        initialState,
        fetchFavoritesList.fulfilled(
          { items: [deRef(10)], pageInfo: { total: 5, page: 1, hasNext: true } },
          'r',
          { page: 1, size: 30 }
        )
      );
      expect(next.list).toEqual([deRef(10)]);
      expect(next.favoritedByKey[assetRefKey(AssetKind.DATA_ENTITY, 10)]).toBe(true);
    });

    it('page > 1 appends to the existing list (load-more)', () => {
      const afterPage1 = reducer(
        initialState,
        fetchFavoritesList.fulfilled(
          { items: [deRef(10)], pageInfo: { total: 5, page: 1, hasNext: true } },
          'r',
          { page: 1, size: 30 }
        )
      );
      const afterPage2 = reducer(
        afterPage1,
        fetchFavoritesList.fulfilled(
          { items: [termRef(11)], pageInfo: { total: 5, page: 2, hasNext: false } },
          'r',
          { page: 2, size: 30 }
        )
      );
      expect(afterPage2.list).toEqual([deRef(10), termRef(11)]);
    });
  });
});
