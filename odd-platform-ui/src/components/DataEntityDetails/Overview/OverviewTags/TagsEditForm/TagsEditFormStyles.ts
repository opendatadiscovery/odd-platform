import styled from 'styled-components';

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
