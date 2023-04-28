import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Button, AppInput } from 'components/shared/elements';
import { ClearIcon } from 'components/shared/icons';
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
          <Button text='Delete' buttonType='secondary-sm' onClick={onItemRemove} />
        )}
      </S.LabelItemButtons>
    </>
  );
};

export default LabelCreateFormItem;
