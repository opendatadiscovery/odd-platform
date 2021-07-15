import { createStyles, Theme, WithStyles } from '@material-ui/core';
import { colWidthStyles } from 'components/Search/Results/ResultsStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      borderBottom: '1px solid #EBECF0',
      padding: theme.spacing(1.25, 0),
      textDecoration: 'none',
      cursor: 'pointer',
      alignItems: 'center',
      '&:hover': {
        backgroundColor: '#F4F5F7',
      },
    },
    ...colWidthStyles,
  });

export type StylesType = WithStyles<typeof styles>;
