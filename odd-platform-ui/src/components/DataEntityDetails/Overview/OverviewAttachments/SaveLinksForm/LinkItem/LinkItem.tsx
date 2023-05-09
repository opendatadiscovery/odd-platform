import React, { type FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { AppInput, Button } from 'components/shared/elements';
import { ClearIcon } from 'components/shared/icons';
import { Grid } from '@mui/material';
import type { DataEntityLinkListFormData } from 'generated-sources';

interface LinkItemProps {
  idx: number;
  onItemRemove: (idx: number) => void;
  fieldsCount: number;
}

const LinkItem: FC<LinkItemProps> = ({ idx, onItemRemove, fieldsCount }) => {
  const { control } = useFormContext<DataEntityLinkListFormData>();

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
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <AppInput
            {...field}
            placeholder='Place link here'
            label='URL'
            required
            customEndAdornment={{
              variant: 'clear',
              showAdornment: !!field.value,
              onCLick: () => field.onChange(''),
              icon: <ClearIcon />,
            }}
          />
        )}
      />
      <Controller
        name={`items.${idx}.name`}
        control={control}
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <AppInput
            {...field}
            sx={{ mt: 1, mb: 2 }}
            placeholder='Enter custom name'
            label='Custom name'
            required
            customEndAdornment={{
              variant: 'clear',
              showAdornment: !!field.value,
              onCLick: () => field.onChange(''),
              icon: <ClearIcon />,
            }}
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
