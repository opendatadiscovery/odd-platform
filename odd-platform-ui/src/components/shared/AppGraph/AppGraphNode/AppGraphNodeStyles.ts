import { createStyles, Theme, WithStyles } from '@material-ui/core';
import { DataEntityTypeNameEnum } from 'generated-sources';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      cursor: 'pointer',
      fill: theme.palette.background.default,
      rx: 2,
      '&:hover': {
        '-webkit-filter': `drop-shadow(${theme.shadows[9]})`,
        filter: `drop-shadow(${theme.shadows[9]})`,
      },
    },
    rootNodeRect: {
      stroke: theme.palette.button.primary.normal.border,
      strokeWidth: 1,
    },
    title: {
      fill: theme.palette.common.black,
      fontSize: theme.typography.h4.fontSize,
      fontWeight: theme.typography.h4.fontWeight,
      lineHeight: theme.typography.h4.lineHeight,
    },
    attribute: {
      fill: theme.palette.common.black,
      fontSize: theme.typography.body1.fontSize,
      fontWeight: theme.typography.body1.fontWeight,
      lineHeight: theme.typography.body1.lineHeight,
      width: '168px',
      overflow: 'hidden',
      marginLeft: theme.spacing(0.5),
    },
    placeholder: {
      fill: theme.palette.text.hint,
    },
    attributeLabel: {
      fill: theme.palette.text.secondary,
    },
    type: {
      [`&.${DataEntityTypeNameEnum.SET}`]: {
        fill: theme.palette.entityType.SET,
      },
      [`&.${DataEntityTypeNameEnum.TRANSFORMER}`]: {
        fill: theme.palette.entityType.TRANSFORMER,
      },
      [`&.${DataEntityTypeNameEnum.CONSUMER}`]: {
        fill: theme.palette.entityType.CONSUMER,
      },
      [`&.${DataEntityTypeNameEnum.INPUT}`]: {
        fill: theme.palette.entityType.INPUT,
      },
      [`&.${DataEntityTypeNameEnum.QUALITY_TEST}`]: {
        fill: theme.palette.entityType.QUALITY_TEST,
      },
    },
    typeLabel: {
      fill: theme.palette.common.black,
      fontWeight: theme.typography.body2.fontWeight,
      lineHeight: theme.typography.body2.lineHeight,
    },
    button: {
      cursor: 'pointer',
      fill: theme.palette.button.primaryLight.normal.background,
      '&:hover': {
        fill: theme.palette.button.primaryLight.hover.background,
      },
      '&:active': {
        fill: theme.palette.button.primaryLight.active.background,
      },
    },
    loadMoreSpinnerBack: {
      stroke: theme.palette.common.white,
      fill: 'transparent',
    },
    loadMoreSpinner: {
      fill: 'transparent',
      stroke: theme.palette.button.primaryLight.normal.color,
    },
  });

export type StylesType = WithStyles<typeof styles>;
