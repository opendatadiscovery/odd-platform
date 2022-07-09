import React from 'react';
import { FormControlLabel } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import AppButton from 'components/shared/AppButton/AppButton';
import AppInput from 'components/shared/AppInput/AppInput';

import ClearIcon from 'components/shared/Icons/ClearIcon';
import AppCheckbox from 'components/shared/AppCheckbox/AppCheckbox';
import { TagItemBtnsContainer } from './TagCreateFormItemStyles';

interface TagCreateFormItemProps {
  itemIndex: number;
  onItemRemove: () => void;
  fieldsLength?: number;
}

const TagCreateFormItem: React.FC<TagCreateFormItemProps> = ({
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
          <AppInput
            {...field}
            placeholder="Tag Name"
            name={`tags.${itemIndex}.name`}
            customEndAdornment={{
              variant: 'clear',
              showAdornment: !!field.value,
              onCLick: () => field.onChange(''),
              icon: <ClearIcon />,
            }}
          />
        )}
      />
      <TagItemBtnsContainer container sx={{ mt: 1, mb: 1.5 }}>
        <Controller
          name={`tags.${itemIndex}.important`}
          control={control}
          defaultValue={false}
          render={({ field }) => (
            <FormControlLabel
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...field}
              sx={{ ml: -0.25 }}
              checked={field.value}
              control={<AppCheckbox sx={{ mr: 1 }} />}
              label="Important"
            />
          )}
        />
        {fieldsLength && fieldsLength > 1 && (
          <AppButton size="small" color="dropdown" onClick={onItemRemove}>
            Delete
          </AppButton>
        )}
      </TagItemBtnsContainer>
    </>
  );
};

export default TagCreateFormItem;
