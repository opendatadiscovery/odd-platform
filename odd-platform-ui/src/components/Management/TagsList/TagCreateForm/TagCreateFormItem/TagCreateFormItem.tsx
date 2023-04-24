import React from 'react';
import { FormControlLabel } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { Button, AppInput, AppCheckbox } from 'components/shared/elements';
import { ClearIcon } from 'components/shared/icons';
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
        defaultValue=''
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <AppInput
            {...field}
            placeholder='Tag Name'
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
              {...field}
              sx={{ ml: -0.25 }}
              checked={field.value}
              control={<AppCheckbox sx={{ mr: 1 }} />}
              label='Important'
            />
          )}
        />
        {fieldsLength && fieldsLength > 1 && (
          <Button text='Delete' size='lg' color='tertiary' onClick={onItemRemove} />
        )}
      </TagItemBtnsContainer>
    </>
  );
};

export default TagCreateFormItem;
