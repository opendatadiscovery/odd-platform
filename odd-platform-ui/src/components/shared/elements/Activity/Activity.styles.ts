// The Activity surfaces' AppTooltip bodies (the three filter "(i)" hints and the actor label's "current
// owner" note) use the platform-shared tooltip body. It moved next to AppTooltip itself when the search-syntax
// hint became its second consumer (#1840) - one body, not a copy per feature. Re-exported here so every
// existing `S.TooltipBody` call site is unchanged.
export { TooltipBody } from 'components/shared/elements/AppTooltip/AppTooltipStyles';
