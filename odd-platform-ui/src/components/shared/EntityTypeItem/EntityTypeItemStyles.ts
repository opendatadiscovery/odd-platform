import { Theme } from '@mui/material';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import { DataEntityTypeNameEnum } from 'generated-sources';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      display: 'inline-flex',
      padding: theme.spacing(0.25, 0.56),
      borderRadius: '4px',
      fontSize: theme.typography.body2.fontSize,
      fontWeight: theme.typography.body2.fontWeight,
      lineHeight: theme.typography.body2.lineHeight,
      color: theme.palette.text.primary,
      [`&.${DataEntityTypeNameEnum.SET}`]: {
        backgroundColor: theme.palette.entityType.SET,
      },
      [`&.${DataEntityTypeNameEnum.TRANSFORMER}`]: {
        backgroundColor: theme.palette.entityType.TRANSFORMER,
      },
      [`&.${DataEntityTypeNameEnum.CONSUMER}`]: {
        backgroundColor: theme.palette.entityType.CONSUMER,
      },
      [`&.${DataEntityTypeNameEnum.INPUT}`]: {
        backgroundColor: theme.palette.entityType.INPUT,
      },
      [`&.${DataEntityTypeNameEnum.QUALITY_TEST}`]: {
        backgroundColor: theme.palette.entityType.QUALITY_TEST,
      },
    },
    containerSmall: {
      padding: theme.spacing(0.25, 0.5),
    },
  });

export type StylesType = WithStyles<typeof styles>;
