import React from 'react';
import { FormControlLabel } from '@mui/material';
import { useFormContext, Controller } from 'react-hook-form';
import AppButton from 'components/shared/AppButton/AppButton';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import * as S from './TagCreateFormItemStyles';

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
          <AppTextField
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
      <S.TagItemBtnsContainer container sx={{ mt: 1, mb: 1.5 }}>
        <Controller
          name={`tags.${itemIndex}.important`}
          control={control}
          defaultValue={false}
          render={({ field }) => (
            <FormControlLabel
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...field}
              sx={{ ml: 0.5, mr: 0 }}
              checked={field.value}
              control={<S.ImportantCheckbox sx={{ mr: 1 }} />}
              label="Important"
            />
          )}
        />
        {fieldsLength && fieldsLength > 1 && (
          <AppButton size="small" color="dropdown" onClick={onItemRemove}>
            Delete
          </AppButton>
        )}
      </S.TagItemBtnsContainer>
    </>
  );
};

export default TagCreateFormItem;
