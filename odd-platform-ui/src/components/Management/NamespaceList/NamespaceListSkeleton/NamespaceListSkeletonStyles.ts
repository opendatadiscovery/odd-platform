import { colWidthStyles } from 'components/Search/Results/ResultsStyles';
import { createStyles, WithStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      padding: theme.spacing(1.25, 1),
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
