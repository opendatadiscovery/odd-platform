import React, { type FC, useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Handlebars from 'handlebars';
import { FormControlLabel, Grid, Typography } from '@mui/material';
import { Button, Checkbox, AppInput, Markdown } from 'components/shared/elements';
import { ClearIcon } from 'components/shared/icons';
import type { IntegrationCodeSnippet as IntegrationCodeSnippetType } from 'generated-sources';
import { useTranslation } from 'react-i18next';

interface IntegrationCodeSnippetWithFormProps {
  snippet: IntegrationCodeSnippetType;
}

const IntegrationCodeSnippetWithForm: FC<IntegrationCodeSnippetWithFormProps> = ({
  snippet,
}) => {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(true);
  const [snippetArgs, setSnippetArgs] = useState({});

  const { handleSubmit, control, formState } = useForm({ mode: 'onChange' });

  const compiledTemplate = Handlebars.compile(snippet.template);

  const templateWithArguments = compiledTemplate(snippetArgs);

  const handleParamsFormSubmit = useCallback((data: any) => {
    setSnippetArgs(data);
    setShowForm(false);
  }, []);

  return showForm ? (
    <Grid container mb={1}>
      <Grid container flexDirection='column' width='45%'>
        <form id='parameters-form' onSubmit={handleSubmit(handleParamsFormSubmit)}>
          {snippet.arguments?.map(arg => {
            if (arg.type === 'BOOLEAN') {
              return (
                <Controller
                  key={arg.name}
                  name={arg.parameter}
                  control={control}
                  defaultValue={false}
                  render={({ field }) => (
                    <FormControlLabel
                      {...field}
                      sx={{ ml: -0.25 }}
                      checked={field.value}
                      control={<Checkbox sx={{ mr: 1 }} />}
                      label={arg.name}
                    />
                  )}
                />
              );
            }

            return (
              <Controller
                key={arg.name}
                name={arg.parameter}
                control={control}
                defaultValue=''
                rules={{
                  required: true,
                  validate: value => {
                    if (typeof value === 'string') return !!value.trim();
                  },
                }}
                render={({ field }) => (
                  <Grid container flexWrap='nowrap' alignItems='center' sx={{ mb: 1 }}>
                    <Grid item lg={4}>
                      <Typography variant='body1'>{arg.name}</Typography>
                    </Grid>
                    <Grid item lg={8}>
                      <AppInput
                        {...field}
                        type={arg.type === 'STRING' ? 'string' : 'number'}
                        placeholder={`Enter ${arg.name} ...`}
                        customEndAdornment={{
                          variant: 'clear',
                          showAdornment: !!field.value,
                          onCLick: () => field.onChange(''),
                          icon: <ClearIcon />,
                        }}
                      />
                    </Grid>
                  </Grid>
                )}
              />
            );
          })}
        </form>
        <Button
          text='Configure'
          type='submit'
          form='parameters-form'
          buttonType='main-lg'
          disabled={!formState.isValid}
          sx={{ width: 'fit-content', mb: 1.5 }}
        />
      </Grid>
    </Grid>
  ) : (
    <Grid container mb={1} justifyContent='flex-end'>
      <Button
        text={t('Reconfigure')}
        buttonType='main-lg'
        onClick={() => setShowForm(true)}
        sx={{ mb: 1, justifySelf: 'flex-end' }}
      />
      <Markdown value={templateWithArguments} />
    </Grid>
  );
};

export default IntegrationCodeSnippetWithForm;
