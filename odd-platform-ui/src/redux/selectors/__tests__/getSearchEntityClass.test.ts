import { getSearchEntityClass } from 'redux/selectors';
import type { RootState } from 'redux/interfaces';

/**
 * ST-8 (#1842) — `getSearchEntityClass` decides two things on the search page: whether the **Type** facet
 * renders (`Filters.tsx`) and whether the Create-Data-Entity-Group button shows (`Results.tsx`). Both gate on
 * it being a NUMBER.
 *
 * Until ST-8 the selector opened with `if (search.myObjects) return 'my'`. That was correct while "My Objects"
 * was one option in a one-of-N result TAB strip: picking it was mutually exclusive with picking a class, so
 * "owned scope selected" really did mean "no class selected". ST-8 retires the strip and makes the owned scope
 * an ordinary sidebar filter three rows from **Data entity type**, so "My Objects + Datasets" is now an
 * ordinary combination — and the short-circuit turned it into one filter silently switching another off.
 *
 * `search.myObjects` still rides the legacy `/api/search` session request unchanged (ADR D9); these cases pin
 * that it no longer masquerades as an entity class.
 */
const state = (myObjects: boolean, totals: Record<string, unknown>): RootState =>
  ({ dataEntitySearch: { myObjects, totals } }) as unknown as RootState;

const CLASS_TOTALS = {
  all: 12,
  myObjectsTotal: 4,
  DATA_SET: { id: 1, name: 'DATA_SET', selected: true },
  DATA_TRANSFORMER: { id: 2, name: 'DATA_TRANSFORMER', selected: false },
};

describe('getSearchEntityClass (ST-8 / #1842)', () => {
  it('returns the selected class id when the owned scope is ALSO active — the regression this closes', () => {
    // Pre-ST-8 this returned 'my', so ticking "My Objects" hid the Type facet and the DEG button even
    // though Datasets was explicitly selected. An operator would see a filter vanish for no stated reason.
    expect(getSearchEntityClass(state(true, CLASS_TOTALS))).toBe(1);
  });

  it('returns the selected class id when the owned scope is inactive (unchanged behaviour)', () => {
    expect(getSearchEntityClass(state(false, CLASS_TOTALS))).toBe(1);
  });

  it("returns 'all' when no class is selected, owned scope or not — Type stays hidden, as before", () => {
    const noneSelected = {
      all: 12,
      myObjectsTotal: 4,
      DATA_SET: { id: 1, name: 'DATA_SET', selected: false },
    };
    expect(getSearchEntityClass(state(false, noneSelected))).toBe('all');
    expect(getSearchEntityClass(state(true, noneSelected))).toBe('all');
  });

  it("never returns the retired 'my' pseudo-class, whatever the state", () => {
    expect(getSearchEntityClass(state(true, CLASS_TOTALS))).not.toBe('my');
    expect(getSearchEntityClass(state(true, { all: 0, myObjectsTotal: 0 }))).not.toBe(
      'my'
    );
  });
});
