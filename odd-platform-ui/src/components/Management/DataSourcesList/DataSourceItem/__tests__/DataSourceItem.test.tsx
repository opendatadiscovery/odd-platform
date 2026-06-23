import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import theme from 'theme/mui.theme';
import { render } from 'lib/tests/testHelpers';
import PermissionContext from 'components/shared/contexts/Permission/PermissionContext';
import { dataSourceApi } from 'lib/api';
import type { DataSource } from 'generated-sources';
import DataSourceItem from '../DataSourceItem';

/**
 * #1766 ARM-2 (redux-thunk) / PLT-233 — a refused destructive confirm must NOT close-as-success.
 *
 * DataSourceItem's delete dispatches the `deleteDataSource` THUNK. A redux-toolkit dispatch promise
 * RESOLVES even on a rejected action, so a bare `dispatch(thunk(...))` made the shared
 * ConfirmationDialog close exactly as on success when the backend refused the delete. The fix appends
 * `.unwrap()`, which rejects on the rejected action so the dialog's `.catch` keeps it open with the
 * error. These tests inject a rejecting API explicitly: GREEN on the fix, RED if `.unwrap()` is
 * reverted to a bare dispatch.
 *
 * The Edit affordance (DataSourceForm) is unrelated to the delete-confirm wiring and pulls in a heavy
 * form dialog — stub it so the only button before opening is the Delete trigger.
 */
vi.mock('../../DataSourceForm/DataSourceForm', () => ({ default: () => null }));

const dataSource = { id: 1, oddrn: 'oddrn://ds/1', name: 'My datasource' } as DataSource;

const setup = () =>
  render(
    <MuiThemeProvider theme={theme}>
      <PermissionContext.Provider
        value={{ isAllowedTo: true, getHasAccessTo: () => true }}
      >
        <DataSourceItem dataSource={dataSource} />
      </PermissionContext.Provider>
    </MuiThemeProvider>
  );

const openDialog = async () => {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
  });
  return screen.findByRole('dialog');
};

const confirmDeleteIn = async (dialog: HTMLElement) => {
  await act(async () => {
    fireEvent.click(within(dialog).getByRole('button', { name: /delete/i }));
  });
};

describe('DataSourceItem — delete confirm (thunk arm, #1766 / PLT-233)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('REJECTED delete → the dialog STAYS OPEN with the inline error (no close-as-success)', async () => {
    vi.spyOn(dataSourceApi, 'deleteDataSource').mockRejectedValue({
      // generated-client ResponseError shape: the real Response sits at .response
      response: new Response(
        JSON.stringify({ message: 'Cannot delete: still referenced' }),
        { status: 500, headers: { 'content-type': 'application/json' } }
      ),
    });

    setup();
    const dialog = await openDialog();
    expect(
      within(dialog).getByText('Are you sure you want to delete this datasource?')
    ).toBeInTheDocument();

    await confirmDeleteIn(dialog);

    // the unwrapped rejection flows to the dialog's `.catch` → generic inline error, dialog stays open
    expect(await within(dialog).findByText('An error occurred')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(dataSourceApi.deleteDataSource).toHaveBeenCalledWith({ dataSourceId: 1 });
  });

  it('RESOLVED delete → the dialog closes (success path unchanged)', async () => {
    vi.spyOn(dataSourceApi, 'deleteDataSource').mockResolvedValue(undefined);

    setup();
    const dialog = await openDialog();
    await confirmDeleteIn(dialog);

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
