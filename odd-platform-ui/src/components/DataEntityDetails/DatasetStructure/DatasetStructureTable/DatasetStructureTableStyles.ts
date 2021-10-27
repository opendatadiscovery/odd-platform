import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const columnBasicStyles = (theme: Theme) => ({
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
    alignItems: 'center',
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
    borderRightColor: theme.palette.backgrounds.primary,
    paddingRight: '15px',
  },
});

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      position: 'relative',
      marginTop: theme.spacing(2.5),
    },
    tableHeader: {
      color: theme.palette.texts.hint,
      '& > *': {
        borderBottom: '1px solid',
        borderBottomColor: theme.palette.backgrounds.primary,
      },
      '& > $columnDivided': {
        borderRightColor: 'transparent',
      },
    },
    ...columnBasicStyles(theme),
  });

export type StylesType = WithStyles<typeof styles>;
