import styled from 'styled-components';

export const HighlightedTextPart = styled('span')<{
  isHighlighted: boolean;
}>(({ theme, isHighlighted }) => ({
  backgroundColor: isHighlighted ? theme.palette.warning.light : 'none',
}));

export const OptionsContainer = styled('div')<{ $isImportant?: boolean }>(
  ({ theme, $isImportant }) =>
    $isImportant
      ? {
          position: 'relative',
          '&:after': {
            position: 'absolute',
            content: '""',
            top: '9px',
            right: '-8px',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            backgroundColor: theme.palette.tag.important.hover.background,
          },
        }
      : { position: 'relative' }
);
