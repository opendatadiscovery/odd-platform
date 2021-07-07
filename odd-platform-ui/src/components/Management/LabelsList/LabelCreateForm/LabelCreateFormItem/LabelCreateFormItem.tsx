import React from 'react';
import { withStyles, TextField } from '@material-ui/core';
import { useFormContext, Controller } from 'react-hook-form';
import AppButton from 'components/shared/AppButton/AppButton';
import { styles, StylesType } from './LabelCreateFormItemStyles';

interface LabelCreateFormItemProps extends StylesType {
  itemIndex: number;
  onItemRemove: () => void;
}

const LabelCreateFormItem: React.FC<LabelCreateFormItemProps> = ({
  classes,
  itemIndex,
  onItemRemove,
}) => {
  const { control } = useFormContext();

  return (
    <>
      <Controller
        name={`labels.${itemIndex}.name`}
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            placeholder="Label Name"
            variant="outlined"
            name={`labels.${itemIndex}.name`}
          />
        )}
      />
      <div className={classes.labelItemButtons}>
        <AppButton size="small" color="dropdown" onClick={onItemRemove}>
          Delete
        </AppButton>
      </div>
    </>
  );
};

export default withStyles(styles)(LabelCreateFormItem);
