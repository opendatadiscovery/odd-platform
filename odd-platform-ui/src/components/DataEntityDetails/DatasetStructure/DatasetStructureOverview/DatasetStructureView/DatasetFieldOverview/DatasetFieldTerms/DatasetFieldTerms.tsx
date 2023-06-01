import React, { type FC, useCallback } from 'react';
import { Grid, Typography } from '@mui/material';
import { Button } from 'components/shared/elements';
import { WithPermissions } from 'components/shared/contexts';
import type { DataSetField, TermRef } from 'generated-sources';
import { Permission } from 'generated-sources';
import { useAppDispatch } from 'redux/lib/hooks';
import {
  addDatasetFieldTerm,
  deleteDatasetFieldTerm,
} from 'redux/slices/datasetStructure.slice';
import * as S from '../DatasetFieldOverview.styles';
import TermItem from './TermItem/TermItem';
import AssignFieldTermForm from './AssignFieldTermForm/AssignFieldTermForm';

interface DatasetFieldTermsProps {
  fieldTerms: DataSetField['terms'];
  datasetFieldId: number;
}

const DatasetFieldTerms: FC<DatasetFieldTermsProps> = ({
  fieldTerms,
  datasetFieldId,
}) => {
  const dispatch = useAppDispatch();

  const handleAddTerm = useCallback(
    (term: TermRef) => {
      dispatch(addDatasetFieldTerm({ fieldId: datasetFieldId, term }));
    },
    [datasetFieldId]
  );

  const removeTerm = useCallback(
    (termId: number) => {
      dispatch(deleteDatasetFieldTerm({ fieldId: datasetFieldId, termId }));
    },
    [datasetFieldId]
  );

  const content = React.useMemo(
    () =>
      fieldTerms && fieldTerms.length > 0 ? (
        <Grid container mt={1}>
          {fieldTerms.map(({ name, definition, id }) => (
            <TermItem
              key={id}
              termId={id}
              name={name}
              definition={definition}
              datasetFieldId={datasetFieldId}
              removeTerm={removeTerm}
            />
          ))}
        </Grid>
      ) : (
        <Typography mt={1} variant='subtitle1'>
          Terms are not added yet
        </Typography>
      ),
    [fieldTerms?.length, fieldTerms]
  );

  return (
    <S.SectionContainer container>
      <Grid container justifyContent='space-between'>
        <Typography variant='h5' color='texts.hint'>
          TERMS
        </Typography>
        <WithPermissions
          permissionTo={Permission.DATASET_FIELD_ADD_TERM}
          renderContent={({ isAllowedTo: addTerm }) => (
            <AssignFieldTermForm
              datasetFieldId={datasetFieldId}
              handleAddTerm={handleAddTerm}
              openBtnEl={
                <Button
                  disabled={!addTerm}
                  text='Add term'
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
  );
};

export default DatasetFieldTerms;
