import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { describe, it, expect, vi } from 'vitest';
import theme from 'theme/mui.theme';
import { render, clickByText } from 'lib/tests/testHelpers';
import ConfirmationDialog from 'components/shared/elements/ConfirmationDialog/ConfirmationDialog';

/**
 * #1766 / CTRIB-027 — the shared ConfirmationDialog must NOT swallow a rejected onConfirm.
 *
 * On main, `onClose`'s `.catch(() => {})` discarded the rejection: `isLoading` was never reset (the
 * DialogWrapper sets pointer-events:none while loading → a mouse-dead, wedged modal) and no reason was
 * shown. These tests inject the failing condition explicitly (a rejecting onConfirm) and assert the
 * FIXED contract: clear loading, surface the error inline, keep the dialog open. RED on main, GREEN on fix.
 */
const TITLE = 'Are you sure you want to delete this?';
const CONFIRM = 'Confirm delete';

// The design-system Button is MUI-styled (reads theme.palette.button.*), so the component tree needs the
// MUI ThemeProvider in addition to the styled-components one the shared render helper supplies.
const setup = (onConfirm: () => Promise<unknown>) =>
  render(
    <MuiThemeProvider theme={theme}>
      <ConfirmationDialog
        actionTitle={TITLE}
        actionName={CONFIRM}
        actionText='It will be deleted permanently'
        onConfirm={onConfirm}
        actionBtn={<button type='button'>open-trigger</button>}
      />
    </MuiThemeProvider>
  );

const openThenConfirm = async () => {
  await clickByText('open-trigger');
  expect(screen.getByText(TITLE), 'the dialog opened').toBeInTheDocument();
  await clickByText(CONFIRM);
};

describe('ConfirmationDialog — rejected confirm handling (#1766 / CTRIB-027)', () => {
  it('REJECTED onConfirm → surfaces the error inline and KEEPS the dialog open (no swallow)', async () => {
    const onConfirm = vi.fn().mockRejectedValue({
      // a generated-client ResponseError shape: the real Response sits at .response
      response: new Response(
        JSON.stringify({ message: 'Cannot delete: still referenced' }),
        {
          status: 400,
          headers: { 'content-type': 'application/json' },
        }
      ),
    });

    setup(onConfirm);
    await openThenConfirm();

    // the reason is shown inline (swallowed by `.catch(() => {})` on main)
    expect(
      await screen.findByText('Cannot delete: still referenced')
    ).toBeInTheDocument();
    // the dialog stays OPEN so the user can read it and retry / cancel
    expect(screen.getByText(TITLE)).toBeInTheDocument();
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('REJECTED onConfirm with no server message → shows the generic fallback, dialog stays open', async () => {
    const onConfirm = vi.fn().mockRejectedValue(new Error('network down'));

    setup(onConfirm);
    await openThenConfirm();

    expect(await screen.findByText('An error occurred')).toBeInTheDocument();
    expect(screen.getByText(TITLE)).toBeInTheDocument();
  });

  it('RESOLVED onConfirm → closes the dialog (success path unchanged)', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);

    setup(onConfirm);
    await openThenConfirm();

    await waitFor(() => expect(screen.queryByText(TITLE)).not.toBeInTheDocument());
  });
});
