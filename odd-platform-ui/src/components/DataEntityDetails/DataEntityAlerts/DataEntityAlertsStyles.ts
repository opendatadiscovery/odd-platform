import { createStyles, WithStyles } from '@material-ui/core';
import { ODDTheme } from 'theme/interfaces';

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

export const styles = (theme: ODDTheme) =>
  createStyles({
    container: {},
    alertsTableHeader: {
      color: theme.palette.text.hint,
      borderBottom: '1px solid',
      borderBottomColor: theme.palette.divider,
    },
    ...alertsColWidthStyles,
  });

export type StylesType = WithStyles<typeof styles>;
