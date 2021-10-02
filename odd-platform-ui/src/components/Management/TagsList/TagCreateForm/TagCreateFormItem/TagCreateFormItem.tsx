import React from 'react';
import {
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  InputAdornment,
} from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import { useFormContext, Controller } from 'react-hook-form';
import CancelIcon from 'components/shared/Icons/CancelIcon';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import AppButton2 from 'components/shared/AppButton2/AppButton2';
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
          <TextField
            {...field}
            fullWidth
            placeholder="Tag Name"
            variant="outlined"
            name={`tags.${itemIndex}.name`}
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
          <AppButton2 size="small" color="dropdown" onClick={onItemRemove}>
            Delete
          </AppButton2>
        )}
      </Grid>
    </>
  );
};

export default withStyles(styles)(TagCreateFormItem);
