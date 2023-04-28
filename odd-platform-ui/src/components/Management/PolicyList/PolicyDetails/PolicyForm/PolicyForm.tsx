import React from 'react';
import { useAppPaths, usePermissions } from 'lib/hooks';
import { useAppDispatch } from 'redux/lib/hooks';
import { Grid, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { createPolicy, updatePolicy } from 'redux/thunks';
import { Button, AppInput, AppJSONEditor } from 'components/shared/elements';
import { ClearIcon } from 'components/shared/icons';
import { Permission, type PolicyDetails, type PolicyFormData } from 'generated-sources';
import { useNavigate } from 'react-router-dom';

interface PolicyFormProps {
  schema: Record<string, unknown>;
  policyId: PolicyDetails['id'] | undefined;
  name: PolicyDetails['name'];
  policy: PolicyDetails['policy'];
}

const PolicyForm: React.FC<PolicyFormProps> = ({ schema, policyId, name, policy }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { ManagementRoutes } = useAppPaths();
  const { hasAccessTo } = usePermissions();
  const canUpdatePolicy = hasAccessTo(Permission.POLICY_UPDATE);

  const isAdministrator = name === 'Administrator';
  const toPolicies = `../${ManagementRoutes.policies}`;
  const defaultValues = React.useMemo(() => ({ name, policy }), [name, policy]);

  const { control, handleSubmit, setValue, formState } = useForm<PolicyFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues,
  });

  const handleFormSubmit = (policyFormData: PolicyFormData) => {
    dispatch(
      policyId
        ? updatePolicy({ policyId, policyFormData })
        : createPolicy({ policyFormData })
    ).then(response => {
      if (response.meta.requestStatus === 'fulfilled') {
        navigate(toPolicies);
      }
    });
  };

  const [isValid, setIsValid] = React.useState(true);

  const handleOnValidate = React.useCallback(
    (isJSONValid: boolean, result: string, onChange: (...event: unknown[]) => void) => {
      if (isJSONValid) {
        onChange(result);
        setIsValid(true);
        return;
      }

      setIsValid(false);
    },
    [setIsValid]
  );

  return (
    <Grid container flexDirection='column' flexWrap='nowrap'>
      <Grid container justifyContent='space-between' alignItems='center'>
        <Typography variant='h1' component='span'>
          {policyId
            ? `${isAdministrator || !canUpdatePolicy ? 'View' : 'Edit'} policy ${name}`
            : 'Create policy'}
        </Typography>
        <Button
          to={toPolicies}
          sx={{ ml: 2 }}
          buttonType='secondary-m-icon'
          icon={<ClearIcon />}
        />
      </Grid>
      <form id='policy-form' onSubmit={handleSubmit(handleFormSubmit)}>
        <Controller
          name='name'
          control={control}
          rules={{ required: true, validate: value => !!value.trim() }}
          render={({ field }) => (
            <AppInput
              {...field}
              disabled={isAdministrator || !canUpdatePolicy}
              sx={{ mt: 3 }}
              label='Name'
              placeholder='Enter policy name'
              customEndAdornment={{
                variant: 'clear',
                showAdornment: !!field.value,
                onCLick: () => setValue('name', ''),
                icon: <ClearIcon />,
              }}
            />
          )}
        />
        <Typography variant='subtitle2' mt={1} mb={0.5} fontWeight={500}>
          JSON
        </Typography>
        <Controller
          name='policy'
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <AppJSONEditor
              readOnly={!canUpdatePolicy || isAdministrator}
              schema={schema}
              onValidate={(isJSONValid, result) =>
                handleOnValidate(isJSONValid, result, field.onChange)
              }
              content={{ text: field.value || '{}' }}
            />
          )}
        />
      </form>
      {canUpdatePolicy && !isAdministrator && (
        <Button
          text={policyId ? 'Save changes' : 'Create'}
          type='submit'
          form='policy-form'
          buttonType='main-lg'
          fullWidth
          sx={{ mt: 3, width: 'fit-content' }}
          disabled={!(formState.isValid && isValid && !isAdministrator)}
        />
      )}
    </Grid>
  );
};

export default PolicyForm;
