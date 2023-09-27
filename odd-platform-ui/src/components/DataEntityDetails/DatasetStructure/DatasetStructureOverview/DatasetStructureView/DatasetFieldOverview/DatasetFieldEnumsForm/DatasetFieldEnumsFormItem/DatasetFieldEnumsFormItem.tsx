import type { HTMLInputTypeAttribute } from 'react';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'components/shared/elements';
import { DataSetFieldTypeTypeEnum } from 'generated-sources';
import * as S from './DatasetFieldEnumsFormItem.styles';

interface DatasetFieldEnumsFormItemProps {
  itemIndex: number;
  onItemRemove: () => void;
  datasetFieldType: DataSetFieldTypeTypeEnum;
  isKeyEditable: boolean;
  isValueEditable: boolean | undefined;
}

const DatasetFieldEnumsFormItem: React.FC<DatasetFieldEnumsFormItemProps> = ({
  itemIndex,
  onItemRemove,
  datasetFieldType,
  isKeyEditable,
  isValueEditable = true,
}) => {
  const { t } = useTranslation();
  const { control, getValues } = useFormContext();

  const setTextFieldType = React.useCallback((): HTMLInputTypeAttribute => {
    if (datasetFieldType === DataSetFieldTypeTypeEnum.INTEGER) return 'number';
    return 'text';
  }, [datasetFieldType]);

  const setTextValidationByType = React.useCallback(
    (value: number | string) => {
      if (
        datasetFieldType === DataSetFieldTypeTypeEnum.STRING &&
        typeof value === 'string'
      )
        return !!value.trim();
      return Number.isInteger(Number(value));
    },
    [datasetFieldType]
  );

  return (
    <S.Container container>
      <Controller
        name={`enums.${itemIndex}.name`}
        control={control}
        defaultValue={getValues(`enums.${itemIndex}.name`)}
        rules={{ required: true, validate: setTextValidationByType }}
        render={({ field }) => (
          <S.ValueNameContainer sx={{ mr: 1 }}>
            <Input
              {...field}
              disabled={isKeyEditable}
              variant='main-m'
              placeholder={t('Name of value')}
              name={`enums.${itemIndex}.name`}
              type={setTextFieldType()}
            />
          </S.ValueNameContainer>
        )}
      />
      <Controller
        name={`enums.${itemIndex}.description`}
        defaultValue={getValues(`enums.${itemIndex}.description`)}
        control={control}
        render={({ field }) => (
          <S.ValueDescriptionContainer sx={{ mr: 1 }}>
            <Input
              {...field}
              variant='main-m'
              sx={{ mr: 1 }}
              disabled={!isValueEditable}
              placeholder={t('Description')}
              name={`enums.${itemIndex}.description`}
            />
          </S.ValueDescriptionContainer>
        )}
      />
      {!isKeyEditable && (
        <Button
          text={t('Delete')}
          buttonType='secondary-sm'
          onClick={onItemRemove}
          sx={{ flexShrink: 0 }}
        />
      )}
    </S.Container>
  );
};

export default DatasetFieldEnumsFormItem;
