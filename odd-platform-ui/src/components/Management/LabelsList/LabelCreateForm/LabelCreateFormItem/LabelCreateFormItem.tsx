import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import AppButton from 'components/shared/AppButton/AppButton';
import AppInput from 'components/shared/AppInput/AppInput';

import ClearIcon from 'components/shared/Icons/ClearIcon';
import * as S from './LabelCreateFormItemStyles';

interface LabelCreateFormItemProps {
  itemIndex: number;
  onItemRemove: () => void;
  fieldsLength?: number;
}

const LabelCreateFormItem: React.FC<LabelCreateFormItemProps> = ({
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
        defaultValue=''
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <AppInput
            {...field}
            placeholder='Label Name'
            name={`labels.${itemIndex}.name`}
            customEndAdornment={{
              variant: 'clear',
              showAdornment: !!field.value,
              onCLick: () => field.onChange(''),
              icon: <ClearIcon />,
            }}
          />
        )}
      />
      <S.LabelItemButtons sx={{ mt: 1, mb: 1.5 }}>
        {fieldsLength && fieldsLength > 1 && (
          <AppButton size='small' color='dropdown' onClick={onItemRemove}>
            Delete
          </AppButton>
        )}
      </S.LabelItemButtons>
    </>
  );
};

export default LabelCreateFormItem;
