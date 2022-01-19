import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { propsChecker } from 'lib/helpers';

type AlertColType =
  | 'col'
  | 'name'
  | 'description'
  | 'updatedBy'
  | 'status'
  | 'createdTime'
  | 'updatedAt'
  | 'actionBtn';

export const alertsMainColWidthStyles = {
  col: {
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    paddingRight: '8px',
    paddingLeft: '8px',
    '&:last-of-type': {
      paddingRight: 0,
    },
  },
  name: {
    flex: '0 0 14%',
  },
  description: {
    flex: '0 0 43%',
  },
  updatedBy: {
    flex: '0 0 9%',
  },
  status: {
    flex: '0 0 7%',
  },
  createdTime: {
    flex: '0 0 12%',
  },
  updatedAt: {
    flex: '0 0 12%',
  },
  actionBtn: {
    flex: '0 0 3%',
    overflow: 'visible',
  },
};

export const AlertsTableHeader = styled(Grid)(({ theme }) => ({
  color: theme.palette.texts.hint,
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.divider,
}));

export const ColContainer = styled(Grid, {
  shouldForwardProp: propsChecker,
})<{
  $colType: AlertColType;
}>(({ $colType }) => ({
  ...alertsMainColWidthStyles.col,
  ...alertsMainColWidthStyles[$colType],
}));
