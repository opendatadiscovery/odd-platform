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
    itemLink: {
      color: 'initial',
      textDecoration: 'none',
      flexGrow: 1,
      overflow: 'hidden',
    },
    typesList: {
      display: 'flex',
      flexWrap: 'nowrap',
      '& > *': {
        marginLeft: theme.spacing(1),
      },
    },
    stats: {
      display: 'flex',
      alignItems: 'center',
      '& > *': { lineHeight: 'normal' },
      '& * + *': { marginLeft: theme.spacing(0.5) },
    },
    srcList: {
      display: 'flex',
      alignItems: 'start',
    },
    srcListCaption: {
      color: theme.typography.subtitle1.color,
      marginRight: theme.spacing(1),
    },
    srcListContent: {
      display: 'flex',
      flexWrap: 'nowrap',
      flexDirection: 'column',
      justifyContent: 'center',
      '& a': {
        color: theme.palette.primary.main,
      },
    },
    updatedAt: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-end',
      '& span': { marginLeft: theme.spacing(0.5) },
    },
    ownerName: {
      color: theme.palette.primary.main,
      fontSize: theme.typography.body1.fontSize,
      letterSpacing: theme.typography.body1.letterSpacing,
      '&:hover': { textDecoration: 'underline' },
    },
    tagItem: {
      margin: theme.spacing(0.5),
    },
    tagsContainer: {
      margin: theme.spacing(1, -0.5, -0.5, -0.5),
    },
    infoContainer: { marginTop: theme.spacing(2) },
    truncatedList: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      margin: theme.spacing(-0.25, -0.25),
      '& > *': {
        margin: theme.spacing(0.25, 0.25),
      },
    },
    ...colWidthStyles,
  });

export type StylesType = WithStyles<typeof styles>;
