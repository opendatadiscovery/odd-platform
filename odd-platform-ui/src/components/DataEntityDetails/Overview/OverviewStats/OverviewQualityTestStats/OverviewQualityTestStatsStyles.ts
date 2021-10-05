import { Theme } from '@mui/material';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import { DataQualityTestRunStatusEnum } from 'generated-sources';

export const styles = (theme: Theme) =>
  createStyles({
    statsContainer: {
      justifyContent: 'space-between',
      '& > *': {
        flex: '0 0 278px',
        marginRight: theme.spacing(4),
        '&:last-child': { marginRight: 0 },
      },
    },
    typeLabel: {
      marginBottom: theme.spacing(1.25),
    },
    links: {},
    linkCount: { marginRight: theme.spacing(0.5) },
    statLabel: {
      color: theme.palette.text.secondary,
      lineHeight: theme.typography.h2.lineHeight,
    },
    link: {
      margin: theme.spacing(0.25, 0),
      '&:first-of-type': {
        marginTop: theme.spacing(1),
      },
    },
    suites: { marginTop: theme.spacing(5) },
    overview: {
      '& > *': {
        marginBottom: theme.spacing(1),
        marginLeft: theme.spacing(0.25),
        '&:last-child': { marginLeft: 0 },
      },
    },
    latestRunStatus: {
      [`&.${DataQualityTestRunStatusEnum.SUCCESS}`]: {
        color: theme.palette.runStatus.SUCCESS,
      },
      [`&.${DataQualityTestRunStatusEnum.FAILED}`]: {
        color: theme.palette.runStatus.FAILED,
      },
      [`&.${DataQualityTestRunStatusEnum.BROKEN}`]: {
        color: theme.palette.runStatus.BROKEN,
      },
      [`&.${DataQualityTestRunStatusEnum.SKIPPED}`]: {
        color: theme.palette.runStatus.SKIPPED,
      },
      [`&.${DataQualityTestRunStatusEnum.ABORTED}`]: {
        color: theme.palette.runStatus.ABORTED,
      },
      [`&.${DataQualityTestRunStatusEnum.UNKNOWN}`]: {
        color: theme.palette.runStatus.UNKNOWN,
      },
    },
    parameters: {
      margin: theme.spacing(1, 0, 3, 0),
    },
    dataQALinks: {
      marginBottom: theme.spacing(3),
    },
    dataQALinksList: { marginTop: theme.spacing(1) },
    execution: {},
    executionInfo: { marginTop: theme.spacing(1) },
  });

export type StylesType = WithStyles<typeof styles>;
