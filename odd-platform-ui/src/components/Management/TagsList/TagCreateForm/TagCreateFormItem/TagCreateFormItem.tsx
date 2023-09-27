import React from 'react';
import { FormControlLabel } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Input } from 'components/shared/elements';
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
  const { t } = useTranslation();
  const { control } = useFormContext();

  return (
    <>
      <Controller
        name={`tags.${itemIndex}.name`}
        control={control}
        defaultValue=''
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <Input
            {...field}
            variant='main-m'
            placeholder={t('Tag Name')}
            name={`tags.${itemIndex}.name`}
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
              control={<Checkbox sx={{ mr: 1 }} />}
              label={t('Important')}
            />
          )}
        />
        {fieldsLength && fieldsLength > 1 && (
          <Button text={t('Delete')} buttonType='secondary-sm' onClick={onItemRemove} />
        )}
      </TagItemBtnsContainer>
    </>
  );
};

export default TagCreateFormItem;
