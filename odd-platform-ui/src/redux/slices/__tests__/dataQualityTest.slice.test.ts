import { describe, expect, it } from 'vitest';
import { DataQualityTestSeverity } from 'generated-sources';
import type { DataEntity, DataQualityTest } from 'generated-sources';
import { setDataQATestSeverity } from 'redux/thunks';
import type { DataQualityTestState } from 'redux/interfaces';
import reducer, { initialState } from 'redux/slices/dataQualityTest.slice';

/**
 * CTRIB-015 / odd-platform#1750 (RC3) — the severity mutation result must be reduced into the store so
 * the overview reflects a successful save without a full test-list refetch. Pre-fix the slice had no
 * `setDataQATestSeverity.fulfilled` case (the returned DataEntity was discarded -> the cached test kept
 * its pre-edit severity until the next list refetch). This test is RED on the pre-fix slice.
 */
describe('dataQualityTest slice — setDataQATestSeverity.fulfilled (#1750 RC3)', () => {
  const arg = {
    dataEntityId: 1,
    dataqaTestId: 7,
    dataQualityTestSeverityForm: { severity: DataQualityTestSeverity.CRITICAL },
  };

  it('reduces the returned severity into qualityTestsById, preserving the other cached fields', () => {
    const start: DataQualityTestState = {
      ...initialState,
      qualityTestsById: {
        7: {
          id: 7,
          severity: DataQualityTestSeverity.MINOR,
          internalName: 'orders_not_null',
        } as unknown as DataQualityTest,
      },
    };

    const action = setDataQATestSeverity.fulfilled(
      { id: 7, severity: DataQualityTestSeverity.CRITICAL } as unknown as DataEntity,
      'req-1',
      arg
    );
    const next = reducer(start, action);

    expect(next.qualityTestsById[7].severity).toBe(DataQualityTestSeverity.CRITICAL);
    // only severity changed — the rest of the cached test entity is untouched
    expect(next.qualityTestsById[7].internalName).toBe('orders_not_null');
  });

  it('is a no-op when the edited test is not cached (no crash on an unknown id)', () => {
    const action = setDataQATestSeverity.fulfilled(
      { id: 999, severity: DataQualityTestSeverity.MAJOR } as unknown as DataEntity,
      'req-2',
      arg
    );
    const next = reducer(initialState, action);

    expect(next.qualityTestsById[999]).toBeUndefined();
  });
});
