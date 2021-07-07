import { Theme, createStyles, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {},
    dataCount: {
      display: 'flex',
      marginRight: theme.spacing(3),
      fontWeight: theme.typography.fontWeightBold,
      '& + $dataCount': { marginLeft: theme.spacing(1) },
      '& span': {
        margin: theme.spacing(0, 0.5),
      },
    },
    revisionContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    revisionSelect: {
      marginLeft: theme.spacing(1),
      backgroundColor: 'transparent',
      minWidth: '80px',
      '&:before': {
        content: 'none',
      },
    },
    revisionSelectSelect: {
      paddingLeft: theme.spacing(1),
      marginLeft: 0,
      fontWeight: theme.typography.fontWeightRegular,
    },
    typesCount: {
      display: 'flex',
      alignItems: 'center',
    },
    typesCountItem: {
      '& > *': {
        marginLeft: theme.spacing(0.5),
      },
      '& + $typesCountItem': { marginLeft: theme.spacing(5) },
    },
    typesCountItemPct: {
      color: '#A8B0BD',
      fontSize: theme.typography.body2.fontSize,
      fontWeight: theme.typography.body2.fontWeight,
      lineHeight: theme.typography.body2.lineHeight,
    },
    statIcon: {},
    columnsName: { color: '#A8B0BD' },
  });

export type StylesType = WithStyles<typeof styles>;
