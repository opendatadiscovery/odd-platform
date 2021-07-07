import { createStyles, Theme, WithStyles } from '@material-ui/core';

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
    paddingRight: theme.spacing(2),
  },
  uniqCol: {
    paddingLeft: 0,
    paddingRight: 0,
    width: '160px',
    display: 'flex',
    flexGrow: 1,
    // justifyContent: 'flex-end',
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
    borderRightColor: '#F4F5F7',
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
      color: '#A8B0BD',
      '& > *': {
        borderBottom: '1px solid',
        borderBottomColor: '#F4F5F7',
      },
      '& > $columnDivided': {
        borderRightColor: 'transparent',
      },
    },
    ...columnBasicStyles(theme),
  });

export type StylesType = WithStyles<typeof styles>;
