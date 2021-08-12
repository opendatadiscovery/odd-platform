import { createStyles, Theme, WithStyles } from '@material-ui/core';
import { columnBasicStyles } from '../DatasetStructureTableStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      position: 'relative',
    },
    rowInfo: {
      minHeight: '41px',
      borderBottom: '1px solid',
      borderBottomColor: '#F4F5F7',
      '& > *': {
        padding: theme.spacing(0.5, 0),
        alignItems: 'center',
      },
      '&:hover': {
        backgroundColor: '#F4F5F7',
        '& $optionsBtn': {
          opacity: 1,
        },
      },
    },
    rowChildren: {},
    collapseBtn: {
      height: '14px',
      width: '14px',
      borderRadius: '2px',
      backgroundColor: '#C4C4C4',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      '& > *': {
        width: '6px',
        height: '6px',
      },
    },
    collapseBtnOpen: {
      backgroundColor: '#091E42',
    },
    treeDividerContainer: {
      width: '14px',
      marginRight: '5px',
    },
    treeDivider: {
      cursor: 'pointer',
      padding: theme.spacing(0.25, 0, 0, 0),
      backgroundColor: 'transparent',
      border: 'none',
      outline: 'none',
    },
    nameContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingRight: theme.spacing(9),
    },
    descriptionContainer: {
      paddingRight: theme.spacing(9),
    },
    labelsContainer: {
      display: 'flex',
      minHeight: '30px',
      alignItems: 'center',
      '&:hover $editLabelsBtn': {
        opacity: 1,
      },
    },
    labelsList: {},
    externalDescription: {
      color: '#7A869A',
    },
    internalDescription: {
      color: '#42526E',
    },
    childKeys: {
      color: '#42526E',
      display: 'flex',
      alignItems: 'center',
    },
    optionsBtn: {
      opacity: 0,
    },
    colStatsPct: {
      color: '#A8B0BD',
      fontSize: theme.typography.body1.fontSize,
      fontWeight: theme.typography.body1.fontWeight,
      lineHeight: theme.typography.body1.lineHeight,
      marginLeft: theme.spacing(0.5),
    },
    customStatLabel: { fontSize: theme.typography.subtitle2.fontSize },
    ...columnBasicStyles(theme),
  });

export type StylesType = WithStyles<typeof styles>;
