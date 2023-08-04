import React, { type FC, useCallback } from 'react';
import { Grid, Typography } from '@mui/material';
import { Button } from 'components/shared/elements';
import { WithPermissions } from 'components/shared/contexts';
import type { DataSetField, LinkedTerm } from 'generated-sources';
import { Permission } from 'generated-sources';
import { useAppDispatch } from 'redux/lib/hooks';
import {
  addDatasetFieldTerm,
  deleteDatasetFieldTerm,
} from 'redux/slices/datasetStructure.slice';
import { useTranslation } from 'react-i18next';
import * as S from '../DatasetFieldOverview.styles';
import TermItem from './TermItem/TermItem';
import AssignFieldTermForm from './AssignFieldTermForm/AssignFieldTermForm';

interface DatasetFieldTermsProps {
  fieldTerms: DataSetField['terms'];
  datasetFieldId: number;
  isStatusDeleted: boolean;
}

const DatasetFieldTerms: FC<DatasetFieldTermsProps> = ({
  fieldTerms,
  datasetFieldId,
  isStatusDeleted,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const handleAddTerm = useCallback(
    (linkedTerm: LinkedTerm) => {
      dispatch(addDatasetFieldTerm({ fieldId: datasetFieldId, linkedTerm }));
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
          {fieldTerms.map(({ term, isDescriptionLink }) => (
            <TermItem
              key={term.id}
              termId={term.id}
              name={term.name}
              definition={term.definition}
              datasetFieldId={datasetFieldId}
              removeTerm={removeTerm}
              isDescriptionLink={isDescriptionLink}
            />
          ))}
        </Grid>
      ) : (
        <Typography mt={1} variant='subtitle1'>
          {t('Terms are not added yet')}
        </Typography>
      ),
    [fieldTerms?.length, fieldTerms]
  );

  return (
    <S.SectionContainer container>
      <Grid container justifyContent='space-between'>
        <Typography variant='h5' color='texts.hint'>
          {t('TERMS')}
        </Typography>
        {!isStatusDeleted && (
          <WithPermissions
            permissionTo={Permission.DATASET_FIELD_ADD_TERM}
            renderContent={({ isAllowedTo: addTerm }) => (
              <AssignFieldTermForm
                datasetFieldId={datasetFieldId}
                handleAddTerm={handleAddTerm}
                openBtnEl={
                  <Button
                    disabled={!addTerm}
                    text={t('Add term')}
                    buttonType='secondary-m'
                    sx={{ mr: 1 }}
                  />
                }
              />
            )}
          />
        )}
      </Grid>
      <Grid container flexDirection='column' alignItems='flex-start'>
        {content}
      </Grid>
    </S.SectionContainer>
  );
};

export default DatasetFieldTerms;
