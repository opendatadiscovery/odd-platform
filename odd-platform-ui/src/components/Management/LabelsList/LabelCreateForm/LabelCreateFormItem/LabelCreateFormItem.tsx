import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import { useFormContext, Controller } from 'react-hook-form';
import CancelIcon from 'components/shared/Icons/CancelIcon';
import AppButton2 from 'components/shared/AppButton2/AppButton2';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import { styles, StylesType } from './LabelCreateFormItemStyles';

interface LabelCreateFormItemProps extends StylesType {
  itemIndex: number;
  onItemRemove: () => void;
  fieldsLength?: number;
}

const LabelCreateFormItem: React.FC<LabelCreateFormItemProps> = ({
  classes,
  itemIndex,
  onItemRemove,
  fieldsLength,
}) => {
  const { control } = useFormContext();

  return (
    <>
      <Controller
        name={`labels.${itemIndex}.name`}
        control={control}
        defaultValue=""
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            placeholder="Label Name"
            variant="outlined"
            name={`labels.${itemIndex}.name`}
            InputProps={{
              endAdornment: field.value && (
                <InputAdornment position="start">
                  <AppIconButton
                    size="small"
                    color="unfilled"
                    icon={<CancelIcon />}
                    onClick={() => field.onChange('')}
                  />
                </InputAdornment>
              ),
            }}
          />
        )}
      />
      <div className={classes.labelItemButtons}>
        {fieldsLength && fieldsLength > 1 && (
          <AppButton2 size="small" color="dropdown" onClick={onItemRemove}>
            Delete
          </AppButton2>
        )}
      </div>
    </>
  );
};

export default withStyles(styles)(LabelCreateFormItem);
