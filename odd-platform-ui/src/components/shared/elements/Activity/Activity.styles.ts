import styled from 'styled-components';

// Shared styled body for the Activity surfaces' AppTooltips (the three filter "(i)" hints and the actor
// label's "current owner" note). Mirrors the platform's established info-tooltip body
// (InternalDescriptionHeader / TermDefinition `S.Tooltip`): the AppTooltip "light" popper supplies only a
// flat `background.default` with `padding: 0` and `maxWidth: 'unset'`, so the CONTENT must bring its own
// padding, a max width (to wrap), and the border / radius / shadow that make it read as a card. Passing a
// bare string instead renders one unwrapped, edge-to-edge, background-less row of text - the defect
// LSN-035 caught on first authoring (#1657 / CTRIB-010).
export const TooltipBody = styled('div')(({ theme }) => ({
  fontSize: '14px',
  lineHeight: 1.5,
  padding: theme.spacing(1),
  maxWidth: '360px',
  whiteSpace: 'normal',
  border: '1px solid',
  borderRadius: '8px',
  borderColor: theme.palette.border.primary,
  boxShadow: theme.shadows[9],
}));
