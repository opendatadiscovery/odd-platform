import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { render } from 'lib/tests/testHelpers';
import { termApi } from 'lib/api';
import type * as ReactRouterDom from 'react-router-dom';
import type * as Routes from 'routes';
import type * as ReduxSelectors from 'redux/selectors';
import TermDetails from '../TermDetails';

/**
 * #1766 ARM-2 (redux-thunk) / PLT-234 — the SHARPEST instance: a refused term delete must NOT
 * navigate away as if the term were deleted.
 *
 * `handleTermDelete` chains `navigate(termsSearch)` onto the `deleteTerm` dispatch. A redux-toolkit
 * dispatch promise RESOLVES even on a rejected action, so the bare `dispatch(thunk).then(navigate)`
 * navigated away on a FAILED delete — contradicting the error toast. The fix inserts `.unwrap()` so
 * the `.then(navigate)` only runs on success. These tests inject a rejecting / resolving API and
 * assert the navigate gating: GREEN on the fix, RED if `.unwrap()` is reverted.
 *
 * TermDetails is a container (route params + selectors + mount-effect fetches + heavy children); its
 * surroundings are mocked so the REAL `handleTermDelete` + `deleteTerm` thunk + store + `.unwrap()`
 * are what's exercised. The stubbed header invokes `handleTermDelete(termId)` and (like the real
 * TermDetailsHeader's ConfirmationDialog) calls it inside a `.catch` — the dialog catches the
 * unwrapped rejection to show its inline error, so the test mirrors that and the rejection is handled.
 * The full dialog flow is covered by the integration suite (IT-139).
 */
const { navigateSpy, TERM, STATUSES, ERRORS, EMPTY } = vi.hoisted(() => ({
  navigateSpy: vi.fn(),
  TERM: { id: 42, name: 'Customer' },
  STATUSES: { isLoading: false, isNotLoaded: false },
  ERRORS: {},
  EMPTY: [] as unknown[],
}));

vi.mock('react-router-dom', async importOriginal => ({
  ...(await importOriginal<typeof ReactRouterDom>()),
  useNavigate: () => navigateSpy,
}));

vi.mock('routes', async importOriginal => ({
  ...(await importOriginal<typeof Routes>()),
  useTermsRouteParams: () => ({ termId: 42 }),
}));

vi.mock('redux/selectors', async importOriginal => ({
  ...(await importOriginal<typeof ReduxSelectors>()),
  getTermDetails: () => () => TERM,
  getTermDetailsFetchingStatuses: () => STATUSES,
  getTermDetailsFetchingErrors: () => ERRORS,
  getTermSearchId: () => 7,
  getResourcePermissions: () => () => EMPTY,
}));

// `redux/thunks` is deliberately NOT mocked: the slices' extraReducers reference the real thunks'
// `.fulfilled/.pending/.rejected` action creators at store-config time, so replacing them breaks
// reducer registration. `deleteTerm` stays real (the unit under test); the mount-effect fetches run
// for real and fail harmlessly in jsdom (caught inside handleResponseAsyncThunk), while the mocked
// selectors keep the term "loaded" regardless.

vi.mock('../TermDetailsHeader/TermDetailsHeader', () => ({
  default: ({
    termId,
    handleTermDelete,
  }: {
    termId: number;
    handleTermDelete: (id: number) => () => Promise<unknown>;
  }) => {
    // mirror the real TermDetailsHeader: it hands `handleTermDelete(termId)` to ConfirmationDialog as
    // onConfirm, which invokes it inside a `.catch` (the dialog surfaces the unwrapped rejection).
    const onConfirm = handleTermDelete(termId);
    return (
      <button
        type='button'
        onClick={() => {
          onConfirm().catch(() => {});
        }}
      >
        delete-term
      </button>
    );
  },
}));
vi.mock('../TermDetailsTabs/TermDetailsTabs', () => ({ default: () => null }));
vi.mock('../TermDetailsRoutes/TermDetailsRoutes', () => ({ default: () => null }));

const clickDelete = async () => {
  await act(async () => {
    fireEvent.click(screen.getByText('delete-term'));
  });
};

describe('TermDetails — delete navigate gating (thunk arm, #1766 / PLT-234)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    navigateSpy.mockClear();
  });

  it('REJECTED term delete → navigate is NOT called (no navigate-away-as-if-deleted)', async () => {
    vi.spyOn(termApi, 'deleteTerm').mockRejectedValue({
      response: new Response(JSON.stringify({ message: 'Cannot delete' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      }),
    });

    render(<TermDetails />);
    await clickDelete();

    await waitFor(() => expect(termApi.deleteTerm).toHaveBeenCalledWith({ termId: 42 }));
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('RESOLVED term delete → navigate IS called (success navigates to term search)', async () => {
    vi.spyOn(termApi, 'deleteTerm').mockResolvedValue(undefined);

    render(<TermDetails />);
    await clickDelete();

    await waitFor(() => expect(navigateSpy).toHaveBeenCalledTimes(1));
  });
});
