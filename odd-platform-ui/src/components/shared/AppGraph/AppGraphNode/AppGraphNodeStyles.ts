import { createStyles, WithStyles } from '@material-ui/core';
import { DataEntityTypeNameEnum } from 'generated-sources';
import { ODDTheme } from 'theme/interfaces';

export const styles = (theme: ODDTheme) =>
  createStyles({
    container: {
      cursor: 'pointer',
      fill: '#ffffff',
      rx: 2,
      '&:hover': {
        '-webkit-filter': `drop-shadow(${theme.shadows[9]})`,
        filter: `drop-shadow(${theme.shadows[9]})`,
      },
    },
    rootNodeRect: {
      stroke: '#0080FF',
      strokeWidth: 1,
    },
    title: {
      fill: '#000000',
      fontSize: theme.typography.h4.fontSize,
      fontWeight: theme.typography.h4.fontWeight,
      lineHeight: theme.typography.h4.lineHeight,
    },
    attribute: {
      fill: '#000',
      fontSize: theme.typography.body1.fontSize,
      fontWeight: theme.typography.body1.fontWeight,
      lineHeight: theme.typography.body1.lineHeight,
      width: '168px',
      overflow: 'hidden',
      marginLeft: theme.spacing(0.5),
    },
    placeholder: {
      fill: '#A8B0BD',
    },
    attributeLabel: {
      fill: '#7A869A',
    },
    type: {
      [`&.${DataEntityTypeNameEnum.SET}`]: {
        fill: theme.palette.entityType?.SET,
      },
      [`&.${DataEntityTypeNameEnum.TRANSFORMER}`]: {
        fill: theme.palette.entityType?.TRANSFORMER,
      },
      [`&.${DataEntityTypeNameEnum.CONSUMER}`]: {
        fill: theme.palette.entityType?.CONSUMER,
      },
      [`&.${DataEntityTypeNameEnum.INPUT}`]: {
        fill: theme.palette.entityType?.INPUT,
      },
      [`&.${DataEntityTypeNameEnum.QUALITY_TEST}`]: {
        fill: theme.palette.entityType?.QUALITY_TEST,
      },
    },
    typeLabel: {
      fill: '#000',
      fontWeight: theme.typography.body2.fontWeight,
      lineHeight: theme.typography.body2.lineHeight,
    },
  });

export type StylesType = WithStyles<typeof styles>;
