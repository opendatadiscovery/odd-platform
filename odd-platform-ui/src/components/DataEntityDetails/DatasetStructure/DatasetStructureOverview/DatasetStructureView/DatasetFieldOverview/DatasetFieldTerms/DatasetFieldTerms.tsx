import React, { type FC, useCallback, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import { Button } from 'components/shared/elements';
import { WithPermissions } from 'components/shared/contexts';
import type { DataSetField, TermRef } from 'generated-sources';
import { Permission } from 'generated-sources';
import * as S from '../DatasetFieldOverview.styles';
import AddTermForm from './AddTermForm/AddTermForm';
import TermItem from './TermItem/TermItem';

interface DatasetFieldTermsProps {
  fieldTerms: DataSetField['terms'];
  datasetFieldId: number;
}

const DatasetFieldTerms: FC<DatasetFieldTermsProps> = ({
  fieldTerms = [],
  datasetFieldId,
}) => {
  const [terms, setTerms] = useState<TermRef[]>(fieldTerms);

  const handleAddTerm = useCallback(
    (term: TermRef) => setTerms(prev => [...prev, term]),
    []
  );

  const removeTerm = useCallback(
    (termId: number) => setTerms(prev => prev.filter(term => term.id !== termId)),
    []
  );

  const content = React.useMemo(
    () =>
      terms && terms.length > 0 ? (
        <Grid container mt={1}>
          {terms.map(({ name, definition, id }) => (
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
    [terms, terms?.length]
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
            <AddTermForm
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
