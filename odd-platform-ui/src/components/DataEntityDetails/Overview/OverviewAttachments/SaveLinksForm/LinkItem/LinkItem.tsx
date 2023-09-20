import React, { type FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Grid, Typography } from '@mui/material';
import { ErrorMessage } from '@hookform/error-message';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'components/shared/elements';
import type { DataEntityLinkListFormData } from 'generated-sources';

interface LinkItemProps {
  idx: number;
  onItemRemove: (idx: number) => void;
  fieldsCount: number;
}

const LinkItem: FC<LinkItemProps> = ({ idx, onItemRemove, fieldsCount }) => {
  const { t } = useTranslation();
  const { control, formState } = useFormContext<DataEntityLinkListFormData>();

  const isLastLink = idx + 1 === fieldsCount;
  const isFirstLink = idx === 0;

  return (
    <Grid
      sx={theme => ({
        borderBottom: isLastLink ? 'none' : `1px solid ${theme.palette.divider}`,
        mt: isFirstLink ? 0 : 2,
      })}
    >
      <Controller
        name={`items.${idx}.url`}
        control={control}
        rules={{
          required: true,
          pattern: {
            value: /^(https?|ftp|mailto|tel|file|data):\/\//,
            message: 'URL should include protocol',
          },
        }}
        render={({ field }) => (
          <>
            <Input
              {...field}
              variant='main-m'
              sx={{ mt: 1.5 }}
              placeholder={t('Place link here')}
            />
            <ErrorMessage
              errors={formState.errors}
              name={`items.${idx}.url`}
              render={({ message }) => (
                <Typography mt={0.5} variant='body2' color='warning.main'>
                  {message}
                </Typography>
              )}
            />
          </>
        )}
      />
      <Controller
        name={`items.${idx}.name`}
        control={control}
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <Input
            {...field}
            variant='main-m'
            sx={{ mt: 1, mb: 2 }}
            placeholder={t('Enter custom name')}
            label={t('Custom name')}
          />
        )}
      />
      {fieldsCount > 1 && (
        <Button
          sx={{ mb: 2 }}
          text='Delete link'
          buttonType='link-m'
          onClick={() => onItemRemove(idx)}
        />
      )}
    </Grid>
  );
};

export default LinkItem;
