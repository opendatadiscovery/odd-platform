import React, { type FC, type MouseEvent, type PropsWithChildren } from 'react';
import * as S from './AppTooltipStyles';

interface TooltipBadgeProps extends PropsWithChildren {
  /** what the badge is, for assistive tech — the same catalog sentence the tooltip explains (e.g. "Show details") */
  label: string;
  testId?: string;
}

const stopClick = (event: MouseEvent<HTMLSpanElement>) => {
  // A badge is a hover / focus affordance: its tooltip is what the user came for. A click on it must not act as a
  // click on the ROW it sits in — the search row's `onClick` and the Directory row's `<Link>` both open the item
  // (PLT-091 defect 4: "I clicked the icon to look closer and was navigated away"). The star stops its click the
  // same way; the row itself stays the way to open the item.
  event.preventDefault();
  event.stopPropagation();
};

/**
 * The trigger of a tooltip badge, shared by the search row's (?) "why it matched" and the polymorphic (i) details
 * preview (#1899): a keyboard stop that names itself (MUI's SvgIcon is aria-hidden by design), one focus ring, and
 * one click rule. Wrap the glyph in it and hand the result to `AppTooltip` as its child.
 */
// The click handler is a propagation GUARD, not an interaction: the badge's own interaction is hover / focus, which
// MUI's tooltip listeners wire to this focusable span — there is no click action to mirror on the keyboard.
const TooltipBadge: FC<TooltipBadgeProps> = ({ label, testId, children }) => (
  <S.Badge
    tabIndex={0}
    role='img'
    aria-label={label}
    data-testid={testId}
    onClick={stopClick}
  >
    {children}
  </S.Badge>
);

export default TooltipBadge;
