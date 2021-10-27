import { Theme } from '@mui/material';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
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
    treeDividerContainer: {
      marginRight: '5px',
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
      color: theme.palette.texts.hint,
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
