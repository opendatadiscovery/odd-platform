import { createStyles, Theme, WithStyles } from '@material-ui/core';
import { DataEntityTypeNameEnum } from 'generated-sources';
import { entityTypeColors } from 'components/shared/EntityTypeItem/EntityTypeItemStyles';

export const styles = (theme: Theme) =>
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
        fill: entityTypeColors[DataEntityTypeNameEnum.SET],
      },
      [`&.${DataEntityTypeNameEnum.TRANSFORMER}`]: {
        fill: entityTypeColors[DataEntityTypeNameEnum.TRANSFORMER],
      },
      [`&.${DataEntityTypeNameEnum.CONSUMER}`]: {
        fill: entityTypeColors[DataEntityTypeNameEnum.CONSUMER],
      },
      [`&.${DataEntityTypeNameEnum.INPUT}`]: {
        fill: entityTypeColors[DataEntityTypeNameEnum.INPUT],
      },
      [`&.${DataEntityTypeNameEnum.QUALITY_TEST}`]: {
        fill: entityTypeColors[DataEntityTypeNameEnum.QUALITY_TEST],
      },
    },
    typeLabel: {
      fill: '#000',
      fontWeight: theme.typography.body2.fontWeight,
      lineHeight: theme.typography.body2.lineHeight,
    },
    button: {
      cursor: 'pointer',
      fill: '#E5F2FF',
      '&:hover': { fill: '#CCE6FF' },
      '&:active': { fill: '#99CCFF' },
    },
    loadMoreSpinnerBack: {
      stroke: '#fff',
      fill: 'transparent',
    },
    loadMoreSpinner: {
      fill: 'transparent',
      stroke: '#0066CC',
    },
  });

export type StylesType = WithStyles<typeof styles>;
