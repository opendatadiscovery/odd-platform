import React from 'react';
import { Grid, Checkbox, FormControlLabel } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import { useFormContext, Controller } from 'react-hook-form';
import AppButton from 'components/shared/AppButton/AppButton';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import { styles, StylesType } from './TagCreateFormItemStyles';

interface TagCreateFormItemProps extends StylesType {
  itemIndex: number;
  onItemRemove: () => void;
  fieldsLength?: number;
}

const TagCreateFormItem: React.FC<TagCreateFormItemProps> = ({
  classes,
  itemIndex,
  onItemRemove,
  fieldsLength,
}) => {
  const { control } = useFormContext();

  return (
    <>
      <Controller
        name={`tags.${itemIndex}.name`}
        control={control}
        defaultValue=""
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <AppTextField
            {...field}
            placeholder="Tag Name"
            name={`tags.${itemIndex}.name`}
            customEndAdornment={{
              variant: 'clear',
              isShow: !!field.value,
              onCLick: () => field.onChange(''),
            }}
          />
        )}
      />
      <Grid container className={classes.tagItemButtons}>
        <Controller
          name={`tags.${itemIndex}.important`}
          control={control}
          defaultValue={false}
          render={({ field }) => (
            <FormControlLabel
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...field}
              className={classes.checkboxContainer}
              checked={field.value}
              control={<Checkbox className={classes.importantCheckbox} />}
              label="Important"
            />
          )}
        />
        {fieldsLength && fieldsLength > 1 && (
          <AppButton size="small" color="dropdown" onClick={onItemRemove}>
            Delete
          </AppButton>
        )}
      </Grid>
    </>
  );
};

export default withStyles(styles)(TagCreateFormItem);
