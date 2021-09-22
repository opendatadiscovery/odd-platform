import { createStyles, Theme, WithStyles } from '@material-ui/core';
import { DataSetFieldTypeTypeEnum } from 'generated-sources';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      color: theme.palette.text.primary,
      fontWeight: theme.typography.body2.fontWeight,
      lineHeight: theme.typography.body2.lineHeight,
      padding: theme.spacing(0.25, 1),
      border: '1px solid',
      borderRadius: theme.typography.body2.fontSize,
      alignSelf: 'center',
      [`&.${DataSetFieldTypeTypeEnum.STRING}`]: {
        borderColor: theme.palette.structureLabel.STRING.border,
      },
      [`&.${DataSetFieldTypeTypeEnum.BOOLEAN}`]: {
        borderColor: theme.palette.structureLabel.BOOLEAN.border,
      },
      [`&.${DataSetFieldTypeTypeEnum.INTEGER}`]: {
        borderColor: theme.palette.structureLabel.INTEGER.border,
      },
      [`&.${DataSetFieldTypeTypeEnum.NUMBER}`]: {
        borderColor: theme.palette.structureLabel.NUMBER.border,
      },
      [`&.${DataSetFieldTypeTypeEnum.BINARY}`]: {
        borderColor: theme.palette.structureLabel.BINARY.border,
      },
      [`&.${DataSetFieldTypeTypeEnum.DATETIME}`]: {
        borderColor: theme.palette.structureLabel.DATETIME.border,
      },
      [`&.${DataSetFieldTypeTypeEnum.STRUCT}`]: {
        borderColor: theme.palette.structureLabel.STRUCT.border,
      },
      [`&.${DataSetFieldTypeTypeEnum.LIST}`]: {
        borderColor: theme.palette.structureLabel.LIST.border,
      },
      [`&.${DataSetFieldTypeTypeEnum.MAP}`]: {
        borderColor: theme.palette.structureLabel.MAP.border,
      },
    },
  });
export type StylesType = WithStyles<typeof styles>;
