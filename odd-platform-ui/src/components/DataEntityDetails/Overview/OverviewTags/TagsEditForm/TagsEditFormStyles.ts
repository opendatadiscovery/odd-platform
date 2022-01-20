import { styled } from '@mui/material/styles';
import { propsChecker } from 'lib/helpers';

export const TagsList = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(1),
}));
export const OptionsContainer = styled('div', {
  shouldForwardProp: propsChecker,
})<{ $isimportant?: boolean }>(({ theme, $isimportant }) =>
  $isimportant
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
