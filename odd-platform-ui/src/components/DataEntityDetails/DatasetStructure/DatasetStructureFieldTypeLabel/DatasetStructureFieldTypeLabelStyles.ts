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
        borderColor: '#FFDD99',
      },
      [`&.${DataSetFieldTypeTypeEnum.BOOLEAN}`]: {
        borderColor: '#AA99FF',
      },
      [`&.${DataSetFieldTypeTypeEnum.INTEGER}`]: {
        borderColor: '#A8F0A8',
      },
      [`&.${DataSetFieldTypeTypeEnum.NUMBER}`]: {
        borderColor: '#EE99FF',
      },
      [`&.${DataSetFieldTypeTypeEnum.BINARY}`]: {
        borderColor: '#FF9999',
      },
      [`&.${DataSetFieldTypeTypeEnum.DATETIME}`]: {
        borderColor: '#99CCFF',
      },
      [`&.${DataSetFieldTypeTypeEnum.STRUCT}`]: {
        borderColor: '#C1C7D0',
      },
      [`&.${DataSetFieldTypeTypeEnum.LIST}`]: {
        borderColor: '#A7FF33',
      },
      [`&.${DataSetFieldTypeTypeEnum.MAP}`]: {
        borderColor: '#33FF99',
      },
    },
  });
export type StylesType = WithStyles<typeof styles>;
