import { Theme, createStyles, WithStyles } from '@material-ui/core';
import { maxContentWidthWithoutSidebar } from 'lib/constants';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      margin: '0 auto',
      padding: theme.spacing(2),
      width: `${maxContentWidthWithoutSidebar}px`,
      [theme.breakpoints.up(maxContentWidthWithoutSidebar)]: {
        width: '100%',
        maxWidth: `${maxContentWidthWithoutSidebar}px`,
        justifyContent: 'center',
      },
    },
    caption: {
      marginBottom: theme.spacing(2.75),
    },
    tabsContainer: {
      marginBottom: theme.spacing(2),
    },
  });

export type StylesType = WithStyles<typeof styles>;
