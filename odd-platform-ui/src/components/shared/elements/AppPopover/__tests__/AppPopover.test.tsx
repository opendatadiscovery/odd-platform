import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'lib/tests/testHelpers';
import AppPopover from '../AppPopover';

/**
 * PLT-265 — the popover owns its open state, so before this contract existed a child that acted IN PLACE
 * (navigated the page underneath, or mutated and left) had no way to dismiss it: the menu stayed up on top
 * of the result, and because MUI's Popover is a modal the rest of the page stayed `aria-hidden` with it.
 *
 * `children` may now be a render prop receiving the popover's own `onClose`, mirroring `renderOpenBtn`.
 * Both cases are pinned here: the render prop CAN close, and a plain node still renders unchanged — the
 * three other call sites (kebab menus on Term details, Dataset-field header and Query-example details)
 * pass nodes and must not be disturbed.
 */
describe('AppPopover — a child can close the popover it lives in (PLT-265)', () => {
  const openBtn = ({
    onClick,
    ariaDescribedBy,
  }: {
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    ariaDescribedBy: string | undefined;
  }) => (
    <button type='button' aria-describedby={ariaDescribedBy} onClick={onClick}>
      open
    </button>
  );

  it('a render-prop child receives onClose, and calling it dismisses the popover', async () => {
    const user = userEvent.setup();
    render(
      <AppPopover renderOpenBtn={openBtn}>
        {({ onClose }) => (
          <button type='button' onClick={onClose}>
            act and leave
          </button>
        )}
      </AppPopover>
    );

    await user.click(screen.getByRole('button', { name: 'open' }));
    const item = await screen.findByRole('button', { name: 'act and leave' });

    await user.click(item);

    // The whole point: the menu is gone WITHOUT the user having to click away or press Escape.
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'act and leave' })).toBeNull()
    );
  });

  it('a plain-node child still renders — the existing call sites are untouched', async () => {
    const user = userEvent.setup();
    render(
      <AppPopover renderOpenBtn={openBtn}>
        <span>plain child</span>
      </AppPopover>
    );

    expect(screen.queryByText('plain child')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'open' }));
    expect(await screen.findByText('plain child')).toBeVisible();
  });

  it('the popover stays open when the child does NOT call onClose — closing is opt-in, not automatic', async () => {
    const user = userEvent.setup();
    render(
      <AppPopover renderOpenBtn={openBtn}>
        {() => (
          <button type='button' onClick={() => undefined}>
            stay
          </button>
        )}
      </AppPopover>
    );

    await user.click(screen.getByRole('button', { name: 'open' }));
    await user.click(await screen.findByRole('button', { name: 'stay' }));
    expect(screen.getByRole('button', { name: 'stay' })).toBeVisible();
  });
});
