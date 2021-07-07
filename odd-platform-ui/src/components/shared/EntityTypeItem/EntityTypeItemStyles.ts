import { createStyles, Theme, WithStyles } from '@material-ui/core';
import { DataEntityTypeNameEnum } from 'generated-sources';

export const entityTypeColors = {
  [DataEntityTypeNameEnum.SET]: '#FFE5E6',
  [DataEntityTypeNameEnum.TRANSFORMER]: '#EAE5FF',
  [DataEntityTypeNameEnum.CONSUMER]: '#E5F2FF',
  [DataEntityTypeNameEnum.INPUT]: '#E8FCEF',
  [DataEntityTypeNameEnum.QUALITY_TEST]: '#FFF6E5',
};

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      display: 'inline-flex',
      padding: theme.spacing(0.25, 0.56),
      borderRadius: '4px',
      fontSize: theme.typography.body2.fontSize,
      fontWeight: theme.typography.body2.fontWeight,
      lineHeight: theme.typography.body2.lineHeight,
      color: '#091E42',
      [`&.${DataEntityTypeNameEnum.SET}`]: {
        backgroundColor: entityTypeColors[DataEntityTypeNameEnum.SET],
      },
      [`&.${DataEntityTypeNameEnum.TRANSFORMER}`]: {
        backgroundColor:
          entityTypeColors[DataEntityTypeNameEnum.TRANSFORMER],
      },
      [`&.${DataEntityTypeNameEnum.CONSUMER}`]: {
        backgroundColor: entityTypeColors[DataEntityTypeNameEnum.CONSUMER],
      },
      [`&.${DataEntityTypeNameEnum.INPUT}`]: {
        backgroundColor: entityTypeColors[DataEntityTypeNameEnum.INPUT],
      },
      [`&.${DataEntityTypeNameEnum.QUALITY_TEST}`]: {
        backgroundColor:
          entityTypeColors[DataEntityTypeNameEnum.QUALITY_TEST],
      },
    },
    containerSmall: {
      padding: theme.spacing(0.25, 0.5),
    },
  });

export type StylesType = WithStyles<typeof styles>;
