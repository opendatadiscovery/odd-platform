import React from 'react';
import withStyles from '@mui/styles/withStyles';
import { useFormContext, Controller } from 'react-hook-form';
import AppButton from 'components/shared/AppButton/AppButton';
import AppTextField from 'components/shared/AppTextField/AppTextField';
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
          <AppTextField
            {...field}
            placeholder="Label Name"
            name={`labels.${itemIndex}.name`}
            customEndAdornment={{
              variant: 'clear',
              isShow: !!field.value,
              onCLick: () => field.onChange(''),
            }}
          />
        )}
      />
      <div className={classes.labelItemButtons}>
        {fieldsLength && fieldsLength > 1 && (
          <AppButton size="small" color="dropdown" onClick={onItemRemove}>
            Delete
          </AppButton>
        )}
      </div>
    </>
  );
};

export default withStyles(styles)(LabelCreateFormItem);
