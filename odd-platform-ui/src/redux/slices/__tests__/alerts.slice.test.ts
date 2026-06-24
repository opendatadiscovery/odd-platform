import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AlertStatus } from 'generated-sources';
import type { Alert } from 'redux/interfaces';
import reducer, { initialState } from 'redux/slices/alerts.slice';
import { updateAlertStatus } from 'redux/thunks';

/**
 * odd-platform#1803 (CTRIB-034) Defect 1 — a status change made from the per-entity Data Entity > Alerts
 * tab must be reflected in `state.dataEntityAlerts[id].items` WITHOUT a refetch. Pre-fix, the
 * `updateAlertStatus` thunk returned the entity id under the key `dataEntityId` while the reducer reads
 * `entityId`, so the `if (dataEntityId)` per-entity branch was unreachable and the write fell through to the
 * global `state.alerts.items` (which the per-entity tab does not render) — the row stayed stale until reload.
 *
 * The bug is in the THUNK's emitted key, not the reducer (the reducer correctly reads `entityId`). So this
 * test runs the REAL thunk (mocking only the API boundary) to exercise the emitted payload, then feeds the
 * resulting action to the REAL reducer — a hand-crafted `.fulfilled({ entityId })` payload would pass on the
 * buggy system too and prove nothing. RED on pre-fix `dataEntityId:`; GREEN on `entityId:`.
 */

// vi.mock is hoisted above all imports, so `redux/thunks` (and its transitive `lib/api`) load mocked.
const { changeAlertStatus } = vi.hoisted(() => ({ changeAlertStatus: vi.fn() }));
vi.mock('lib/api', () => ({ alertApi: { changeAlertStatus }, dataEntityApi: {} }));
vi.mock('lib/errorHandling', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, showSuccessToast: vi.fn(), showServerErrorToast: vi.fn() };
});

const ENTITY_ID = 2001;
const openAlert = { id: 7, status: AlertStatus.OPEN } as unknown as Alert;
const resolvedAlert = { id: 7, status: AlertStatus.RESOLVED } as unknown as Alert;

const runThunk = (arg: Parameters<typeof updateAlertStatus>[0]) =>
  updateAlertStatus(arg)(vi.fn(), () => ({}), undefined);

describe('alerts slice — updateAlertStatus reflects a status change without a refetch (#1803)', () => {
  beforeEach(() => {
    changeAlertStatus.mockReset();
    changeAlertStatus.mockResolvedValue(resolvedAlert);
  });

  it('Defect 1 — a per-entity resolve updates state.dataEntityAlerts[id].items IN PLACE', async () => {
    const action = await runThunk({
      alertId: 7,
      alertStatusFormData: { status: AlertStatus.RESOLVED },
      entityId: ENTITY_ID,
    });

    // the fulfilled payload must carry the entity id under the key the reducer reads
    expect(action.type).toMatch(/fulfilled$/);
    expect((action.payload as { entityId?: number }).entityId).toBe(ENTITY_ID);

    const start = {
      ...initialState,
      dataEntityAlerts: {
        [ENTITY_ID]: {
          items: [openAlert],
          pageInfo: { total: 1, page: 1, hasNext: false },
          alertCount: 1,
        },
      },
    } as ReturnType<typeof reducer>;

    const next = reducer(start, action);

    // the per-entity list the tab renders now shows the new status — no refetch needed
    expect(next.dataEntityAlerts[ENTITY_ID].items[0].status).toBe(AlertStatus.RESOLVED);
  });

  it('the global Alerts page (no entity id) still updates state.alerts.items in place', async () => {
    const action = await runThunk({
      alertId: 7,
      alertStatusFormData: { status: AlertStatus.RESOLVED },
    });

    const start = {
      ...initialState,
      alerts: { ...initialState.alerts, items: [openAlert] },
    } as ReturnType<typeof reducer>;

    const next = reducer(start, action);

    expect(next.alerts.items[0].status).toBe(AlertStatus.RESOLVED);
  });
});
