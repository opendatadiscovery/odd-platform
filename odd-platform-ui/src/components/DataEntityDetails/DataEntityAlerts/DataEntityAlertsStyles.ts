import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const alertsColWidthStyles = {
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
  colDate: {
    flex: '0 0 12%',
  },
  colType: {
    flex: '0 0 12%',
  },
  colDescription: {
    flex: '0 0 43%',
  },
  colStatus: {
    justifyContent: 'center',
    flex: '0 0 8%',
  },
  colUpdatedBy: {
    flex: '0 0 10%',
  },
  colUpdatedTime: {
    flex: '0 0 12%',
  },
  colActionBtn: {
    flex: '0 0 3%',
    overflow: 'visible',
  },
};

export const styles = (theme: Theme) =>
  createStyles({
    container: { marginTop: theme.spacing(2) },
    alertsTableHeader: {
      color: theme.palette.texts.hint,
      borderBottom: '1px solid',
      borderBottomColor: theme.palette.divider,
    },
    ...alertsColWidthStyles,
  });

export type StylesType = WithStyles<typeof styles>;
