import React, { type FC, useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Handlebars from 'handlebars';
import { FormControlLabel, Grid, Typography } from '@mui/material';
import { AppButton, AppCheckbox, AppInput, Markdown } from 'components/shared/elements';
import { ClearIcon } from 'components/shared/icons';
import type { IntegrationCodeSnippet as IntegrationCodeSnippetType } from 'generated-sources';

interface IntegrationCodeSnippetWithFormProps {
  snippet: IntegrationCodeSnippetType;
}

const IntegrationCodeSnippetWithForm: FC<IntegrationCodeSnippetWithFormProps> = ({
  snippet,
}) => {
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
                      control={<AppCheckbox sx={{ mr: 1 }} />}
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
                        // label={arg.name}
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
        <AppButton
          size='large'
          type='submit'
          form='parameters-form'
          color='primary'
          disabled={!formState.isValid}
          sx={{ width: 'fit-content', mt: 1.5 }}
        >
          Configure
        </AppButton>
      </Grid>
    </Grid>
  ) : (
    <Grid container mb={1} justifyContent='flex-end'>
      <AppButton
        size='large'
        color='primary'
        onClick={() => setShowForm(true)}
        sx={{ mb: 1, justifySelf: 'flex-end' }}
      >
        Reconfigure
      </AppButton>
      <Markdown value={templateWithArguments} />
    </Grid>
  );
};

export default IntegrationCodeSnippetWithForm;
