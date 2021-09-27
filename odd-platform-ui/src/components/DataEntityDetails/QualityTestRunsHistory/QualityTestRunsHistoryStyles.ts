import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const colWidthStyles = {
  colsm: {
    flex: '1 0 3%',
  },
  colmd: {
    flex: '2 0 5%',
  },
  collg: {
    flex: '5 0 18%',
  },
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
};

export const styles = (theme: Theme) =>
  createStyles({
    container: {},
    resultsTable: {},
    runsTableHeader: {
      color: '#B3BAC5',
      '& > *': {
        borderBottom: '1px solid',
        borderBottomColor: '#EBECF0',
      },
    },
    ...colWidthStyles,
  });

export type StylesType = WithStyles<typeof styles>;
