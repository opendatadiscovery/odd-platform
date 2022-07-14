import styled, { CSSObject } from 'styled-components';
import DropdownIcon from 'components/shared/Icons/DropdownIcon';
import { Grid } from '@mui/material';

export const SeparatorIcon = styled(DropdownIcon)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(1),
  transform: 'rotate(-90deg)',
}));

export const Container = styled(Grid)(({ theme }) => ({
  justifyContent: 'space-between',
  flexWrap: 'nowrap',
  alignItems: 'center',
  height: '100%',
}));

// export const StateContainer = styled(Grid)<{
//   $stateDirection: 'row' | 'column';
// }>(({ theme, $stateDirection }) =>
//   $stateDirection === 'column'
//     ? {
//         flexDirection: 'column',
//         padding: theme.spacing(1.5),
//         border: '1px solid',
//         borderColor: theme.palette.divider,
//         borderRadius: '4px',
//         height: '100%',
//         '& > *': {
//           padding: theme.spacing(0.5),
//           marginBottom: theme.spacing(0.5),
//           '&:last-child': { marginBottom: 0 },
//         },
//       }
//     : { flexDirection: 'row' }
// );

// const

export const StateContainer = styled(Grid)<{
  $stateDirection: 'row' | 'column';
}>(({ theme, $stateDirection }) => {
  const basicStyles = {
    padding: theme.spacing(1.5),
    border: '1px solid',
    borderColor: theme.palette.divider,
    borderRadius: '4px',
    height: '100%',
  };

  const columnStyles: CSSObject = {
    ...basicStyles,
    flexDirection: 'column',
    '& > *': {
      padding: theme.spacing(0.5),
      marginBottom: theme.spacing(0.5),
      '&:last-child': { marginBottom: 0 },
    },
  };

  const rowStyles: CSSObject = {
    flexDirection: 'row',
    ...basicStyles,
    '& > *': {
      padding: theme.spacing(0.5),
      marginRight: theme.spacing(0.5),
      '&:last-child': { marginRight: 0 },
    },
  };

  return $stateDirection === 'column' ? columnStyles : rowStyles;
});
