import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'components/shared/elements';
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
  const { t } = useTranslation();
  const { control } = useFormContext();

  return (
    <>
      <Controller
        name={`labels.${itemIndex}.name`}
        control={control}
        defaultValue=''
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <Input
            {...field}
            variant='main-m'
            placeholder={t('Label Name')}
            name={`labels.${itemIndex}.name`}
          />
        )}
      />
      <S.LabelItemButtons sx={{ mt: 1, mb: 1.5 }}>
        {fieldsLength && fieldsLength > 1 && (
          <Button text={t('Delete')} buttonType='secondary-sm' onClick={onItemRemove} />
        )}
      </S.LabelItemButtons>
    </>
  );
};

export default LabelCreateFormItem;
