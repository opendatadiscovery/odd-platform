import React from 'react';
import {
  withStyles,
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
} from '@material-ui/core';
import { useFormContext, Controller } from 'react-hook-form';
import AppButton from 'components/shared/AppButton/AppButton';
import { styles, StylesType } from './TagCreateFormItemStyles';

interface TagCreateFormItemProps extends StylesType {
  itemIndex: number;
  onItemRemove: () => void;
}

const TagCreateFormItem: React.FC<TagCreateFormItemProps> = ({
  classes,
  itemIndex,
  onItemRemove,
}) => {
  const { control } = useFormContext();

  return (
    <>
      <Controller
        name={`tags.${itemIndex}.name`}
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            placeholder="Tag Name"
            variant="outlined"
            name={`tags.${itemIndex}.name`}
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
        <AppButton size="small" color="dropdown" onClick={onItemRemove}>
          Delete
        </AppButton>
      </Grid>
    </>
  );
};

export default withStyles(styles)(TagCreateFormItem);
