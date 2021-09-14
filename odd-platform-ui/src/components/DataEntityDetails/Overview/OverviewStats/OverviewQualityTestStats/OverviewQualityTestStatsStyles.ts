import { createStyles, Theme, WithStyles } from '@material-ui/core';
import { DataQualityTestRunStatusEnum } from 'generated-sources';
import { statusColor } from 'theme/palette';

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
      marginLeft: 0,
      marginBottom: theme.spacing(1.25),
    },
    links: {},
    linkCount: { marginRight: theme.spacing(0.5) },
    statLabel: {
      color: '#7A869A',
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
        marginLeft: theme.spacing(0.5),
        '&:last-child': { marginLeft: 0 },
      },
    },
    latestRunStatus: {
      [`&.${DataQualityTestRunStatusEnum.SUCCESS}`]: {
        color: statusColor.SUCCESS,
      },
      [`&.${DataQualityTestRunStatusEnum.FAILED}`]: {
        color: statusColor.FAILED,
      },
      [`&.${DataQualityTestRunStatusEnum.BROKEN}`]: {
        color: statusColor.BROKEN,
      },
      [`&.${DataQualityTestRunStatusEnum.SKIPPED}`]: {
        color: statusColor.SKIPPED,
      },
      [`&.${DataQualityTestRunStatusEnum.ABORTED}`]: {
        color: statusColor.ABORTED,
      },
      [`&.${DataQualityTestRunStatusEnum.UNKNOWN}`]: {
        color: statusColor.UNKNOWN,
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
