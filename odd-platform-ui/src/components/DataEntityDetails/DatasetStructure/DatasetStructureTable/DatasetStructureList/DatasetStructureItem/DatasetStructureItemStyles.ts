import { Grid, GridProps } from '@mui/material';
import styled from 'styled-components';

type ColType = 'uniq' | 'missing';
export const columnItemBasicStyles = {
  uniq: {
    borderRight: '1px solid #F4F5F7',
    borderLeft: '1px solid #F4F5F7',
  },
  missing: {
    display: 'flex',
    flexGrow: 1,
  },
};
export const OptionsBtnContainer = styled(Grid)<GridProps>(() => ({
  display: 'flex',
  flexWrap: 'nowrap',
  alignItems: 'center',
  opacity: 0,
}));

export const RowInfo = styled(Grid)(({ theme }) => ({
  minHeight: '40px',
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.backgrounds.primary,
  '& > *': {
    padding: theme.spacing(0.5, 0),
    alignItems: 'center',
  },
  '&:hover': {
    backgroundColor: theme.palette.backgrounds.primary,
    [`${OptionsBtnContainer}`]: {
      opacity: 1,
    },
  },
}));

export const TypeContainer = styled(Grid)(() => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
}));

export const Divider = styled(Grid)<{ $colType: ColType }>(
  ({ theme, $colType }) => ({
    borderRight: `1px solid ${theme.palette.backgrounds.primary} `,
    ...columnItemBasicStyles[$colType],
  })
);

export const MissingItem = styled(Grid)(({ theme }) => ({
  display: 'flex',
  flexGrow: 1,
  padding: theme.spacing(0.5, 0),
  alignItems: 'center',
  borderRightColor: theme.palette.backgrounds.primary,
  borderLeftColor: theme.palette.backgrounds.primary,
}));
