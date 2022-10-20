import React from 'react';
import { useAppParams, useAppPaths, usePermissions } from 'lib/hooks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { Grid, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { createPolicy, fetchPolicyDetails, updatePolicy } from 'redux/thunks';
import { AppButton, AppInput, AppJSONEditor } from 'components/shared';
import { ClearIcon } from 'components/shared/Icons';
import { Policy, PolicyFormData } from 'generated-sources';
import { getPolicyDetails } from 'redux/selectors';
import { useHistory } from 'react-router-dom';

const PolicyDetails: React.FC = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { isAdmin } = usePermissions({});
  const { policyId } = useAppParams();
  const { managementPath } = useAppPaths();

  const policyDet = useAppSelector(state => getPolicyDetails(state, policyId));

  const schema = {
    // $id: 'https://ditro.io/policy.json',
    // $schema: 'https://json-schema.org/draft/2019-09/schema',
    title: 'Policy',
    type: 'object',
    properties: {
      resources: {
        type: 'array',
        items: {
          $ref: '#/$defs/policy_resource',
        },
        minItems: 1,
      },
      permissions: {
        type: 'array',
        items: {
          $ref: '#/$defs/policy_permission',
        },
        minItems: 1,
      },
    },
    required: ['resources', 'permissions'],
    $defs: {
      policy_resource: {
        type: 'object',
        properties: {
          type: {
            $ref: '#/$defs/policy_resource_type',
          },
          name: {
            type: 'string',
          },
          conditions: {
            $ref: '#/$defs/policy_resource_condition',
          },
        },
        allOf: [
          {
            required: ['type'],
          },
          {
            anyOf: [
              {
                required: ['name'],
              },
              {
                required: ['conditions'],
              },
            ],
          },
        ],
      },
      policy_resource_condition: {
        type: 'object',
        properties: {
          all: {
            type: 'array',
            items: {
              $ref: '#/$defs/policy_resource_condition',
            },
          },
          any: {
            type: 'array',
            items: {
              $ref: '#/$defs/policy_resource_condition',
            },
          },
          eq: {
            $ref: '#/$defs/policy_resource_condition_unary',
          },
          not_eq: {
            $ref: '#/$defs/policy_resource_condition_unary',
          },
          match: {
            $ref: '#/$defs/policy_resource_condition_unary',
          },
          not_match: {
            $ref: '#/$defs/policy_resource_condition_unary',
          },
          is: {
            $ref: '#/$defs/policy_resource_condition_key',
          },
          not_is: {
            $ref: '#/$defs/policy_resource_condition_key',
          },
        },
        anyOf: [
          {
            required: ['all'],
          },
          {
            required: ['any'],
          },
          {
            required: ['eq'],
          },
          {
            required: ['not_eq'],
          },
          {
            required: ['match'],
          },
          {
            required: ['not_match'],
          },
          {
            required: ['is'],
          },
          {
            required: ['not_is'],
          },
        ],
      },
      policy_resource_condition_unary: {
        type: 'object',
        propertyNames: {
          $ref: '#/$defs/policy_resource_condition_key',
        },
        maxProperties: 1,
        minProperties: 1,
      },
      policy_resource_condition_key: {
        type: 'string',
        enum: [
          'dataEntity:oddrn',
          'dataEntity:internalName',
          'dataEntity:externalName',
          'dataEntity:type',
          'dataEntity:class',
          'dataEntity:datasource:oddrn',
          'dataEntity:datasource:name',
          'dataEntity:namespace:name',
          'dataEntity:tag:name',
          'dataEntity:owner',
          'dataEntity:owner:title:',
        ],
      },
      policy_permission: {
        enum: [
          'DATA_ENTITY_INTERNAL_NAME_UPDATE',
          'DATA_ENTITY_CUSTOM_METADATA_CREATE',
          'DATA_ENTITY_CUSTOM_METADATA_UPDATE',
          'DATA_ENTITY_CUSTOM_METADATA_DELETE',
          'DATA_ENTITY_DESCRIPTION_UPDATE',
          'DATA_ENTITY_OWNERSHIP_CREATE',
          'DATA_ENTITY_OWNERSHIP_UPDATE',
          'DATA_ENTITY_OWNERSHIP_DELETE',
          'DATA_ENTITY_GROUPS_ADD',
          'DATA_ENTITY_GROUPS_DELETE',
          'DATA_ENTITY_TAGS_UPDATE',
          'DATA_ENTITY_TERMS_ADD',
          'DATA_ENTITY_TERMS_DELETE',
          'DATASET_DESCRIPTION_UPDATE',
          'DATASET_LABELS_UPDATE',
          'DATASET_ENUMS_ADD',
          'DATASET_ENUMS_UPDATE',
          'DATASET_ENUMS_DELETE',
        ],
      },
      policy_resource_type: {
        type: 'string',
        enum: [
          'DATA_ENTITY',
          'TERM',
          'DATASOURCE',
          'NAMESPACE',
          'COLLECTOR',
          'TAG',
          'LABEL',
        ],
      },
    },
  };

  const { control, handleSubmit, setValue, formState, reset } = useForm<PolicyFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: { name: policyDet?.name || '', policy: policyDet?.policy || '' },
  });

  React.useEffect(() => {
    if (policyId) {
      dispatch(fetchPolicyDetails({ policyId }))
        .unwrap()
        .then(({ name, policy }) => {
          reset({ name, policy });
        });
    }
  }, [fetchPolicyDetails, policyId]);

  const handleFormSubmit = (policyFormData: PolicyFormData) => {
    dispatch(
      policyId
        ? updatePolicy({ policyId, policyFormData })
        : createPolicy({ policyFormData })
    ).then(response => {
      if (response.meta.requestStatus === 'fulfilled') {
        history.push(managementPath('policies'));
      }
    });
  };

  const [isValid, setIsValid] = React.useState(true);

  const policyController = React.useMemo(
    () => (
      <Controller
        name='policy'
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <AppJSONEditor
            schema={schema}
            onValidate={(isJSONValid, result) => {
              if (!isJSONValid) {
                setIsValid(false);
              } else {
                field.onChange(result);
                setIsValid(true);
              }
            }}
            content={{ text: field.value || '{}' }}
          />
        )}
      />
    ),
    [control, schema]
  );

  return (
    <Grid container flexDirection='column' flexWrap='nowrap'>
      <Typography variant='h4' component='span'>
        {policyId ? `update policy id ${policyId}` : 'create policy'}
      </Typography>
      <form id='policy-form' onSubmit={handleSubmit(handleFormSubmit)}>
        <div id='editor' />
        <Typography variant='h5' color='texts.info'>
          Add or edit labels and description
        </Typography>
        <Controller
          name='name'
          control={control}
          rules={{ required: true, validate: value => !!value.trim() }}
          render={({ field }) => (
            <AppInput
              {...field}
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
        {policyController}
      </form>
      <AppButton
        size='large'
        type='submit'
        form='policy-form'
        color='primary'
        fullWidth
        disabled={!(formState.isValid && isValid)}
      >
        {policyId ? 'Update' : 'Save'}
      </AppButton>
    </Grid>
  );
};

export default PolicyDetails;
