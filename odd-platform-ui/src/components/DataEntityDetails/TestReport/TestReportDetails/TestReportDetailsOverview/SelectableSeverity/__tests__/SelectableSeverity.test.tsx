import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from 'lib/tests/testHelpers';
import { DataQualityTestSeverity } from 'generated-sources';
import type { DataEntity } from 'generated-sources';
import { dataQualityApi } from 'lib/api';
import SelectableSeverity from '../SelectableSeverity';

/**
 * CTRIB-015 / odd-platform#1750 — the severity control must (1) display the CURRENT test's severity
 * (controlled from the prop/store — the fix for the sibling-test render bleed) and (2) gate persistence
 * behind an explicit confirmation instead of the old instant fire-and-forget save. Conforms to the
 * entity-Status edit pattern (adrs/drafts/confirm-and-store-reduce-field-edits.md).
 *
 * ConfirmationDialog is stubbed (it composes the MUI-styled DialogWrapper/Button, which the shared
 * test harness's styled-components-only ThemeProvider can't theme). The stub preserves the real
 * two-step gate — click the option to arm, click the action to confirm — so the persistence gate and
 * the dispatch wiring (this component's responsibility) are what's exercised. AppMenu/AppMenuItem stay
 * real. The full dialog interaction is covered live by integration test IT-081.
 */
vi.mock('components/shared/elements', async importOriginal => {
  const actual = await importOriginal<typeof import('components/shared/elements')>();
  const ConfirmationDialogStub = ({
    actionBtn,
    actionName,
    onConfirm,
  }: {
    actionBtn: React.ReactElement;
    actionName: string;
    onConfirm: () => Promise<unknown>;
  }) => {
    const [armed, setArmed] = React.useState(false);
    return (
      <>
        {React.cloneElement(actionBtn, { onClick: () => setArmed(true) })}
        {armed ? (
          <button type='button' onClick={() => onConfirm()}>
            {actionName}
          </button>
        ) : null}
      </>
    );
  };
  return { ...actual, ConfirmationDialog: ConfirmationDialogStub };
});

describe('SelectableSeverity (#1750)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('displays the current severity from the prop (controlled, not local UI state)', () => {
    render(
      <SelectableSeverity
        currentSeverity={DataQualityTestSeverity.MINOR}
        dataEntityId={1}
        dataQATestId={7}
      />
    );
    expect(screen.getByText('MINOR')).toBeInTheDocument();
  });

  it('does NOT persist on selection — only confirming dispatches the mutation (the gate)', async () => {
    const spy = vi
      .spyOn(dataQualityApi, 'setDataQATestSeverity')
      .mockResolvedValue({ id: 7, severity: DataQualityTestSeverity.CRITICAL } as unknown as DataEntity);

    const { container } = render(
      <SelectableSeverity
        currentSeverity={DataQualityTestSeverity.MINOR}
        dataEntityId={1}
        dataQATestId={7}
      />
    );

    // open the severity menu
    fireEvent.click(container.querySelector('[data-qa="dq-severity"]') as HTMLElement);

    // choosing CRITICAL arms the confirmation — it must NOT persist yet (the confirm gate)
    fireEvent.click(await screen.findByText('CRITICAL'));
    expect(spy).not.toHaveBeenCalled();

    // confirming persists the chosen severity (awaited, then reduced into the store)
    fireEvent.click(await screen.findByText('Apply'));
    await waitFor(() =>
      expect(spy).toHaveBeenCalledWith({
        dataEntityId: 1,
        dataqaTestId: 7,
        dataQualityTestSeverityForm: { severity: DataQualityTestSeverity.CRITICAL },
      })
    );
  });

  it('renders read-only (no menu affordance) when the user lacks the set-severity permission', () => {
    const { container } = render(
      <SelectableSeverity
        currentSeverity={DataQualityTestSeverity.MAJOR}
        dataEntityId={1}
        dataQATestId={7}
        disabled
      />
    );
    expect(screen.getByText('MAJOR')).toBeInTheDocument();
    // the dropdown chevron is absent in the read-only state
    expect(container.querySelector('svg')).toBeNull();
  });
});
