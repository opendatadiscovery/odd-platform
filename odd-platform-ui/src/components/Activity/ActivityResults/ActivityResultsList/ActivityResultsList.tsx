import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Grid, List, ListSubheader, Typography } from '@mui/material';
import { AppButton, SkeletonWrapper } from 'components/shared';
import { ActivityResultsItemSkeleton } from 'components/shared/Activity';
import type { ActivitiesState } from 'redux/interfaces';
import ActivityItem from './ActivityItem/ActivityItem';
import * as S from './ActivityResultsListStyles';

interface ActivityResultsListProps {
  activitiesLength: number;
  fetchNextPage: () => void;
  hasNext: boolean;
  isActivitiesFetching: boolean;
  activitiesByDate: ActivitiesState['activities']['activitiesByType']['ALL']['itemsByDate'];
}

const ActivityResultsList: React.FC<ActivityResultsListProps> = ({
  activitiesLength,
  fetchNextPage,
  isActivitiesFetching,
  hasNext,
  activitiesByDate,
}) => {
  const [hideAllDetails, setHideAllDetails] = React.useState(false);

  const activityItemSkeleton = React.useMemo(
    () => (
      <SkeletonWrapper
        length={10}
        renderContent={({ key }) => (
          <ActivityResultsItemSkeleton width='100%' key={key} />
        )}
      />
    ),
    []
  );

  return activitiesLength ? (
    <S.ListContainer id='activities-list'>
      <InfiniteScroll
        style={{ overflow: 'initial' }}
        dataLength={activitiesLength}
        next={fetchNextPage}
        hasMore={hasNext}
        loader={isActivitiesFetching && activityItemSkeleton}
        scrollThreshold='200px'
        scrollableTarget='activities-list'
      >
        <List subheader={<li />} sx={{ display: 'contents' }}>
          <li>
            <ul style={{ padding: 0 }}>
              {Object.entries(activitiesByDate).map(([activityDate, activities], idx) => (
                // eslint-disable-next-line react/no-array-index-key
                <Grid key={`${activityDate}-${idx}`} container>
                  <ListSubheader sx={{ width: '100%', p: 0 }}>
                    <Grid justifyContent='space-between' container px={2}>
                      <Typography variant='subtitle2' sx={{ py: 1 }}>
                        {activityDate}
                      </Typography>
                      <AppButton
                        size='small'
                        color='tertiary'
                        onClick={() => setHideAllDetails(!hideAllDetails)}
                      >
                        Hide all details
                      </AppButton>
                    </Grid>
                  </ListSubheader>
                  {activities.map(activity => (
                    <ActivityItem
                      key={activity.id}
                      activity={activity}
                      hideAllDetails={hideAllDetails}
                    />
                  ))}
                </Grid>
              ))}
            </ul>
          </li>
        </List>
      </InfiniteScroll>
    </S.ListContainer>
  ) : null;
};

export default ActivityResultsList;
