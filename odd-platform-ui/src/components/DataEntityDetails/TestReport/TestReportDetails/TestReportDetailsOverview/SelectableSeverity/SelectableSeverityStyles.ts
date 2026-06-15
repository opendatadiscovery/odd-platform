import styled from 'styled-components';

interface TriggerProps {
  $disabled?: boolean;
}

// A trigger that visually matches the small outlined AppSelect it replaces (same border
// tokens / height), but opens a confirm-before-persist menu instead of auto-committing.
export const SeverityTrigger = styled('div')<TriggerProps>(({ theme, $disabled }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  minWidth: '140px',
  height: '24px',
  padding: theme.spacing(0.5, 1),
  border: '1px solid',
  borderColor: theme.palette.textField.normal.border,
  borderRadius: '4px',
  cursor: $disabled ? 'default' : 'pointer',
  userSelect: 'none',
  '&:hover': {
    borderColor: $disabled
      ? theme.palette.textField.normal.border
      : theme.palette.textField.hover.border,
  },
  '& > svg': { flexShrink: 0, marginLeft: theme.spacing(1) },
}));
