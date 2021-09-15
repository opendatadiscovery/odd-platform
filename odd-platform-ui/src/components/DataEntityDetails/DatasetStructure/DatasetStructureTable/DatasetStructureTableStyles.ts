import { createStyles, WithStyles } from '@material-ui/core';
import { ODDTheme } from 'theme/interfaces';

export const columnBasicStyles = (theme: ODDTheme) => ({
  collapseCol: {
    width: '20px',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  nameCol: {
    paddingLeft: theme.spacing(1),
    paddingRight: '5px',
    flexGrow: 1,
    maxWidth: 'calc(100% - 72px)',
  },
  typeCol: {
    width: '72px',
    display: 'flex',
    justifyContent: 'flex-end',
    paddingRight: theme.spacing(2),
    '& > *': {
      marginRight: theme.spacing(1),
    },
  },
  uniqCol: {
    paddingLeft: 0,
    paddingRight: 0,
    width: '160px',
    display: 'flex',
    flexGrow: 1,
  },
  missingCol: {
    paddingLeft: 0,
    paddingRight: 0,
    width: '160px',
    display: 'flex',
    flexGrow: 1,
  },
  statsCol: {
    paddingLeft: '20px',
    paddingRight: 0,
  },
  columnDivided: {
    borderRight: '1px solid',
    borderRightColor: theme.palette.background.primary,
    paddingRight: '15px',
  },
});

export const styles = (theme: ODDTheme) =>
  createStyles({
    container: {
      position: 'relative',
      marginTop: theme.spacing(2.5),
    },
    tableHeader: {
      color: theme.palette.text.hint,
      '& > *': {
        borderBottom: '1px solid',
        borderBottomColor: theme.palette.background.primary,
      },
      '& > $columnDivided': {
        borderRightColor: 'transparent',
      },
    },
    ...columnBasicStyles(theme),
  });

export type StylesType = WithStyles<typeof styles>;
