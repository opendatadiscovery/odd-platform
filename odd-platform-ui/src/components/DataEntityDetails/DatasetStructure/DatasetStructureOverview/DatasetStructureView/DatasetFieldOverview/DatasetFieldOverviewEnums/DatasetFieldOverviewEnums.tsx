import React from 'react';
import { Grid, Typography } from '@mui/material';
import { WithPermissions } from 'components/shared/contexts';
import type { DataSetField } from 'generated-sources';
import { Permission } from 'generated-sources';
import { Button, LabeledInfoItem } from 'components/shared/elements';
import { fetchDataSetFieldEnum } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { getDatasetFieldEnums, getDatasetFieldEnumsFetchingError } from 'redux/selectors';
import { resetLoaderByAction } from 'redux/slices/loader.slice';
import { fetchDataSetFieldEnumActionType } from 'redux/actions';
import * as S from '../DatasetFieldOverview.styles';
import DatasetFieldEnumsForm from '../DatasetFieldEnumsForm/DatasetFieldEnumsForm';

interface DatasetFieldOverviewEnumsProps {
  field: DataSetField;
}

const DatasetFieldOverviewEnums: React.FC<DatasetFieldOverviewEnumsProps> = ({
  field,
}) => {
  const dispatch = useAppDispatch();

  const { type: fieldType } = field.type;

  const showEnums = React.useMemo(
    () => fieldType === 'TYPE_STRING' || fieldType === 'TYPE_INTEGER',
    [fieldType]
  );

  React.useEffect(() => {
    if (showEnums) {
      dispatch(fetchDataSetFieldEnum({ datasetFieldId: field.id }));
    }

    return () => {
      dispatch(resetLoaderByAction(fetchDataSetFieldEnumActionType));
    };
  }, [field.id, showEnums]);

  const datasetFieldEnums = useAppSelector(getDatasetFieldEnums(field.id));
  const error = useAppSelector(getDatasetFieldEnumsFetchingError);

  const content = React.useMemo(() => {
    if (error)
      return (
        <Typography mt={1} variant='body1' color='warning.main'>
          There was an error while loading enums, please, try again later.
        </Typography>
      );

    return field.enumValueCount ? (
      <Grid container mt={1}>
        {datasetFieldEnums?.items?.map(({ name, description, id }) => (
          <LabeledInfoItem key={id} inline label={name} labelWidth={4}>
            {description}
          </LabeledInfoItem>
        ))}
      </Grid>
    ) : (
      <Typography mt={1} variant='subtitle1'>
        Enums are not created yet
      </Typography>
    );
  }, [error, field.enumValueCount, datasetFieldEnums?.items]);

  return showEnums ? (
    <S.SectionContainer container>
      <Grid container justifyContent='space-between'>
        <Typography variant='h5' color='texts.hint'>
          ENUMS
        </Typography>
        <WithPermissions
          permissionTo={Permission.DATASET_FIELD_ENUMS_UPDATE}
          renderContent={({ isAllowedTo: editEnums }) => (
            <DatasetFieldEnumsForm
              isExternal={datasetFieldEnums?.external}
              datasetFieldId={field.id}
              datasetFieldName={field.name}
              datasetFieldType={field.type.type}
              defaultEnums={datasetFieldEnums?.items}
              btnCreateEl={
                <Button
                  disabled={!editEnums}
                  text={field.enumValueCount ? 'Edit enums' : 'Add enums'}
                  buttonType='secondary-m'
                  sx={{ mr: 1 }}
                />
              }
            />
          )}
        />
      </Grid>
      <Grid container flexDirection='column' alignItems='flex-start'>
        {content}
      </Grid>
    </S.SectionContainer>
  ) : null;
};

export default DatasetFieldOverviewEnums;
