import React, { type FC, useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Handlebars from 'handlebars';
import { FormControlLabel, Grid, Typography } from '@mui/material';
import { Button, Checkbox, Input, Markdown } from 'components/shared/elements';
import type { IntegrationCodeSnippet as IntegrationCodeSnippetType } from 'generated-sources';

interface IntegrationCodeSnippetWithFormProps {
  snippet: IntegrationCodeSnippetType;
}

const IntegrationCodeSnippetWithForm: FC<IntegrationCodeSnippetWithFormProps> = ({
  snippet,
}) => {
  const [showForm, setShowForm] = useState(true);
  const [snippetArgs, setSnippetArgs] = useState({});

  const { handleSubmit, control, formState, register } = useForm({});

  const compiledTemplate = useCallback(Handlebars.compile(snippet.template), [
    snippet.template,
  ]);

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
                      sx={{
                        ml: 0,
                        mb: 1,
                        width: '100%',
                        justifyContent: 'flex-end',
                      }}
                      labelPlacement='start'
                      checked={field.value}
                      control={<Checkbox sx={{ mr: 1 }} />}
                      disableTypography
                      label={
                        <Grid item lg={4}>
                          <Typography variant='body1'>{arg.name}</Typography>
                        </Grid>
                      }
                    />
                  )}
                />
              );
            }

            if (arg.staticValue) {
              return (
                <input
                  key={arg.name}
                  {...register(arg.parameter)}
                  value={arg.staticValue}
                  style={{ display: 'none' }}
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
                      <Input
                        {...field}
                        variant='main-m'
                        type={arg.type === 'STRING' ? 'string' : 'number'}
                        placeholder={`Enter ${arg.name} ...`}
                        handleCleanUp={() => field.onChange('')}
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
        text='Reconfigure'
        buttonType='main-lg'
        onClick={() => setShowForm(true)}
        sx={{ mb: 1, justifySelf: 'flex-end' }}
      />
      <Markdown value={templateWithArguments} />
    </Grid>
  );
};

export default IntegrationCodeSnippetWithForm;
