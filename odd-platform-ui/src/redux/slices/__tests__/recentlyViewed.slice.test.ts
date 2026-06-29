import { describe, expect, it, vi } from 'vitest';
import {
  AssetKind,
  type RecentlyViewedAsset,
  type RecentlyViewedRef,
} from 'generated-sources';
import reducer, { initialState } from 'redux/slices/recentlyViewed.slice';
import {
  recordRecentlyViewed,
  removeRecentlyViewed,
  fetchRecentlyViewedList,
  fetchRecentlyViewedStatus,
} from 'redux/thunks/recentlyViewed.thunks';
import { assetRefKey } from 'redux/lib/favorites';

/**
 * Recently-Viewed slice (odd-platform#1816). The load-bearing behaviour is the BATCH-HYDRATE reducer for
 * `fetchRecentlyViewedStatus`: a list/detail surface resolves every visible row in one call. The status
 * endpoint returns only the VIEWED subset, so the slice must mark the asked-but-not-viewed refs `null`
 * (not leave them `undefined`, which would make each row re-query) WITHOUT clobbering a value the user just
 * recorded. The reducer is exercised via the real thunk action creators.
 */

vi.mock('lib/api', () => {
  const handler = { get: (_t: object, p: string) => (p === '__esModule' ? true : {}) };
  return new Proxy({ __esModule: true }, handler);
});
vi.mock('lib/errorHandling', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, showSuccessToast: vi.fn(), showServerErrorToast: vi.fn() };
});

const ts = new Date('2026-06-29T10:00:00Z');
const rvRef = (kind: AssetKind, assetId: number, when: Date = ts): RecentlyViewedRef => ({
  assetKind: kind,
  assetId,
  lastViewedAt: when,
});
const askedRef = (kind: AssetKind, assetId: number) => ({ assetKind: kind, assetId });
const deAsset = (id: number): RecentlyViewedAsset =>
  ({
    assetKind: AssetKind.DATA_ENTITY,
    dataEntity: { id },
    lastViewedAt: ts,
  }) as unknown as RecentlyViewedAsset;
const termAsset = (id: number): RecentlyViewedAsset =>
  ({
    assetKind: AssetKind.TERM,
    term: { id },
    lastViewedAt: ts,
  }) as unknown as RecentlyViewedAsset;

describe('recentlyViewed slice', () => {
  it('recordRecentlyViewed marks the asset recently viewed with its timestamp', () => {
    const key = assetRefKey(AssetKind.DATA_ENTITY, 1);
    const next = reducer(
      initialState,
      recordRecentlyViewed.fulfilled({ ref: rvRef(AssetKind.DATA_ENTITY, 1) }, 'r', {
        assetKind: AssetKind.DATA_ENTITY,
        assetId: 1,
      })
    );
    expect(next.recencyByKey[key]).toEqual(rvRef(AssetKind.DATA_ENTITY, 1));
  });

  it('removeRecentlyViewed clears the recency AND drops it from the list', () => {
    const key = assetRefKey(AssetKind.TERM, 5);
    const start = {
      ...initialState,
      recencyByKey: { [key]: rvRef(AssetKind.TERM, 5) },
      list: [termAsset(5)],
    };
    const next = reducer(
      start,
      removeRecentlyViewed.fulfilled({ key }, 'r', {
        assetKind: AssetKind.TERM,
        assetId: 5,
      })
    );
    expect(next.recencyByKey[key]).toBeNull();
    expect(next.list).toHaveLength(0);
  });

  describe('fetchRecentlyViewedStatus batch hydrate', () => {
    const A = rvRef(AssetKind.DATA_ENTITY, 1); // viewed
    const askedA = askedRef(AssetKind.DATA_ENTITY, 1);
    const askedC = askedRef(AssetKind.TERM, 3); // asked, not viewed, previously unknown

    it('resolves asked-but-not-viewed refs to null (so rows do not re-query)', () => {
      const next = reducer(
        initialState,
        fetchRecentlyViewedStatus.fulfilled(
          { asked: [askedA, askedC], viewed: [A] },
          'r',
          {
            assetRef: [askedA, askedC],
          }
        )
      );
      expect(next.recencyByKey[assetRefKey(AssetKind.DATA_ENTITY, 1)]).toEqual(A);
      expect(next.recencyByKey[assetRefKey(AssetKind.TERM, 3)]).toBeNull();
    });

    it('never clobbers a value just recorded (fill-unknowns only)', () => {
      const optimistic = rvRef(AssetKind.DATA_ENTITY, 2);
      const start = {
        ...initialState,
        recencyByKey: { [assetRefKey(AssetKind.DATA_ENTITY, 2)]: optimistic },
      };
      const askedB = askedRef(AssetKind.DATA_ENTITY, 2);
      // Server reply omits B (recorded locally after this request was sent).
      const next = reducer(
        start,
        fetchRecentlyViewedStatus.fulfilled(
          { asked: [askedA, askedB, askedC], viewed: [A] },
          'r',
          {
            assetRef: [askedA, askedB, askedC],
          }
        )
      );
      expect(next.recencyByKey[assetRefKey(AssetKind.DATA_ENTITY, 2)]).toEqual(
        optimistic
      );
      expect(next.recencyByKey[assetRefKey(AssetKind.DATA_ENTITY, 1)]).toEqual(A);
      expect(next.recencyByKey[assetRefKey(AssetKind.TERM, 3)]).toBeNull();
    });
  });

  describe('fetchRecentlyViewedList', () => {
    it('page 1 replaces the list and hydrates recency for every item', () => {
      const next = reducer(
        initialState,
        fetchRecentlyViewedList.fulfilled(
          { items: [deAsset(10)], pageInfo: { total: 5, page: 1, hasNext: true } },
          'r',
          { page: 1, size: 5 }
        )
      );
      expect(next.list).toEqual([deAsset(10)]);
      expect(next.recencyByKey[assetRefKey(AssetKind.DATA_ENTITY, 10)]).toEqual(
        rvRef(AssetKind.DATA_ENTITY, 10)
      );
    });

    it('page > 1 appends to the existing list (load-more)', () => {
      const afterPage1 = reducer(
        initialState,
        fetchRecentlyViewedList.fulfilled(
          { items: [deAsset(10)], pageInfo: { total: 5, page: 1, hasNext: true } },
          'r',
          { page: 1, size: 5 }
        )
      );
      const afterPage2 = reducer(
        afterPage1,
        fetchRecentlyViewedList.fulfilled(
          { items: [termAsset(11)], pageInfo: { total: 5, page: 2, hasNext: false } },
          'r',
          { page: 2, size: 5 }
        )
      );
      expect(afterPage2.list).toEqual([deAsset(10), termAsset(11)]);
    });
  });
});
