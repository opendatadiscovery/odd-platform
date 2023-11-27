import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
import {
  Button,
  EmptyContentPlaceholder,
  QueryExamplesListHeader,
  QueryExamplesListItem,
  QueryExamplesSkeleton,
} from 'components/shared/elements';
import { LinkIcon } from 'components/shared/icons';
import { useTranslation } from 'react-i18next';
import { useAppParams } from 'lib/hooks';
import {
  useGetQueryExamplesByDatasetId,
  useUnassignEntityQueryExample,
} from 'lib/hooks/api/dataModelling/queryExamples';
import AssignEntityQueryExampleForm from './AssignEntityQueryExampleForm';
import { WithPermissions } from '../../shared/contexts';
import { Permission } from '../../../generated-sources';

const DataEntityDetailsQueryExamples: React.FC = () => {
  const { t } = useTranslation();
  const { dataEntityId } = useAppParams();
  const { data, isLoading } = useGetQueryExamplesByDatasetId({ dataEntityId });

  const queryExamples = useMemo(() => data?.items ?? [], [data?.items]);

  const isEmpty = useMemo(
    () => queryExamples.length === 0 && !isLoading,
    [queryExamples.length, isLoading]
  );

  return (
    <Grid container gap={2} mt={2}>
      <Grid item display='flex' justifyContent='end' alignItems='center' xs={12}>
        <WithPermissions permissionTo={Permission.QUERY_EXAMPLE_DATASET_CREATE}>
          <AssignEntityQueryExampleForm
            dataEntityId={dataEntityId}
            openBtnEl={
              <Button
                buttonType='secondary-lg'
                startIcon={<LinkIcon />}
                text={t('Link query')}
              />
            }
          />
        </WithPermissions>
      </Grid>
      <Grid item xs={12}>
        <QueryExamplesListHeader />
        {queryExamples.map(qe => (
          <QueryExamplesListItem
            queryExample={qe}
            key={qe.definition}
            dataEntityId={dataEntityId}
          />
        ))}
        {isLoading && <QueryExamplesSkeleton />}
        {isEmpty && <EmptyContentPlaceholder />}
      </Grid>
    </Grid>
  );
};

export default DataEntityDetailsQueryExamples;
