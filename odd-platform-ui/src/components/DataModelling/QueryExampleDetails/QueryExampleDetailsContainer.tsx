import React, { useCallback, useMemo, useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import {
  useDeleteQueryExample,
  useGetQueryExampleDetails,
} from 'lib/hooks/api/dataModelling/queryExamples';
import { useAppDateTime } from 'lib/hooks';
import {
  AppLoadingPage,
  AppMenuItem,
  AppPopover,
  Button,
  ConfirmationDialog,
} from 'components/shared/elements';
import { EditIcon, KebabIcon, TimeGapIcon } from 'components/shared/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { dataModellingPath } from 'routes/dataModellingRoutes';
import QueryExampleDetailsTabs from './QueryExampleDetailsTabs';
import QueryExampleDetailsOverview from './QueryExampleDetailsOverview';
import QueryExampleDetailsLinkedEntities from './QueryExampleDetailsLinkedEntities';
import QueryExampleForm from '../QueryExampleForm/QueryExampleForm';

const QueryExampleDetailsContainer: React.FC = () => {
  const { queryExampleId: exampleId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: queryExampleDetails, isLoading } = useGetQueryExampleDetails({
    exampleId: Number(exampleId) || 0,
  });
  const { mutateAsync: deleteQueryExample } = useDeleteQueryExample();

  const [selectedTab, setSelectedTab] = useState(0);
  const handleTabChange = useCallback(() => {
    setSelectedTab(prev => (prev === 0 ? 1 : 0));
  }, []);

  const { formatDistanceToNowStrict } = useAppDateTime();

  const updatedAt = useMemo(
    () =>
      formatDistanceToNowStrict(
        queryExampleDetails ? queryExampleDetails.updatedAt : new Date(),
        { addSuffix: true }
      ),
    [queryExampleDetails?.updatedAt, formatDistanceToNowStrict]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      await deleteQueryExample({ exampleId: id });
      navigate(dataModellingPath('query-examples'));
    },
    [queryExampleDetails?.id]
  );

  return queryExampleDetails && !isLoading ? (
    <Grid container gap={2} flexDirection='column'>
      <Grid item display='flex' alignItems='center' justifyContent='space-between'>
        <Typography variant='h1'>{`Query Example #${exampleId}`}</Typography>
        <Box display='flex' alignItems='center'>
          <TimeGapIcon />
          <Typography variant='body1' sx={{ ml: 1 }}>
            {updatedAt}
          </Typography>
          <QueryExampleForm
            btnCreateEl={
              <Button
                text={t('Edit')}
                buttonType='secondary-m'
                startIcon={<EditIcon />}
                sx={{ ml: 1 }}
              />
            }
            queryExampleDetails={queryExampleDetails}
          />
          <AppPopover
            renderOpenBtn={({ onClick, ariaDescribedBy }) => (
              <Button
                aria-describedby={ariaDescribedBy}
                buttonType='secondary-m'
                icon={<KebabIcon />}
                onClick={onClick}
                sx={{ ml: 1 }}
              />
            )}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: -5, horizontal: 67 }}
          >
            <ConfirmationDialog
              actionTitle={t('Are you sure you want to delete this query example?')}
              actionName={t('Delete query example')}
              actionText={
                <>
                  Query Example #{queryExampleDetails.id}{' '}
                  {t('will be deleted permanently')}
                </>
              }
              onConfirm={() => handleDelete(queryExampleDetails.id)}
              actionBtn={<AppMenuItem>{t('Delete')}</AppMenuItem>}
            />
          </AppPopover>
        </Box>
      </Grid>
      <Grid item alignItems='center'>
        <QueryExampleDetailsTabs
          selectedTab={selectedTab}
          onHandleTabChange={handleTabChange}
          linkedEntitiesHint={queryExampleDetails?.linkedEntities.pageInfo.total}
        />
      </Grid>
      <Grid item container gap={2} flexDirection='column' alignItems='start'>
        {selectedTab === 0 && (
          <QueryExampleDetailsOverview
            definition={queryExampleDetails.definition}
            query={queryExampleDetails.query}
          />
        )}
        {selectedTab === 1 && (
          <QueryExampleDetailsLinkedEntities
            entities={queryExampleDetails.linkedEntities.items}
          />
        )}
      </Grid>
    </Grid>
  ) : (
    <AppLoadingPage />
  );
};

export default QueryExampleDetailsContainer;
