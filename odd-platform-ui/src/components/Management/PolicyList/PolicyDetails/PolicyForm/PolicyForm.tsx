import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePermissions } from 'lib/hooks';
import { useAppDispatch } from 'redux/lib/hooks';
import { createPolicy, updatePolicy } from 'redux/thunks';
import { AppJSONEditor, Button, Input } from 'components/shared/elements';
import { ClearIcon } from 'components/shared/icons';
import { Permission, type PolicyDetails, type PolicyFormData } from 'generated-sources';
import { managementPath } from 'routes/managementRoutes';
import { useIsEmbeddedPath } from 'lib/hooks/useAppPaths/useIsEmbeddedPath';

interface PolicyFormProps {
  schema: Record<string, unknown>;
  policyId: PolicyDetails['id'] | undefined;
  name: PolicyDetails['name'];
  policy: PolicyDetails['policy'];
}

const PolicyForm: React.FC<PolicyFormProps> = ({ schema, policyId, name, policy }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { updatePath } = useIsEmbeddedPath();
  const { hasAccessTo } = usePermissions();
  const canUpdatePolicy = hasAccessTo(Permission.POLICY_UPDATE);

  const isAdministrator = name === 'Administrator';
  const toPolicies = updatePath(managementPath('policies'));
  const defaultValues = React.useMemo(() => ({ name, policy }), [name, policy]);

  const { control, handleSubmit, formState } = useForm<PolicyFormData>({
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
            ? `${
                isAdministrator || !canUpdatePolicy ? t('View policy') : t('Edit policy')
              } ${name}`
            : t('Create policy')}
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
            <Input
              {...field}
              variant='main-m'
              disabled={isAdministrator || !canUpdatePolicy}
              sx={{ mt: 3 }}
              label={t('Name')}
              placeholder={t('Enter policy name')}
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
          text={policyId ? t('Save changes') : t('Create')}
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
