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
      borderBottomColor: theme.palette.backgrounds.primary,
      '& > *': {
        padding: theme.spacing(0.5, 0),
        alignItems: 'center',
      },
      '&:hover': {
        backgroundColor: theme.palette.backgrounds.primary,
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
      backgroundColor: theme.palette.text.secondary,
      color: theme.palette.common.white,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      '& > *': {
        width: '6px',
        height: '6px',
      },
    },
    collapseBtnOpen: {
      backgroundColor: theme.palette.backgrounds.darken,
    },
    treeDividerContainer: {
      width: '14px',
      minWidth: '14px',
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
    },
    labelsList: {},
    externalDescription: {
      color: theme.palette.text.secondary,
    },
    internalDescription: {
      color: theme.palette.texts.info,
    },
    childKeys: {
      color: theme.palette.texts.info,
      display: 'flex',
      alignItems: 'center',
    },
    optionsBtn: {
      opacity: 0,
    },
    colStatsPct: {
      color: theme.palette.text.hint,
      fontSize: theme.typography.body1.fontSize,
      fontWeight: theme.typography.body1.fontWeight,
      lineHeight: theme.typography.body1.lineHeight,
      marginLeft: theme.spacing(0.5),
    },
    customStatLabel: { fontSize: theme.typography.subtitle2.fontSize },
    logicalTypeIcon: { display: 'flex', alignItems: 'center' },
    ...columnBasicStyles(theme),
  });

export type StylesType = WithStyles<typeof styles>;
