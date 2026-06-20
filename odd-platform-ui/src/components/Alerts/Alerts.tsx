import React from 'react';
import { Grid, Typography } from '@mui/material';
import omit from 'lodash/omit';
import { useTranslation } from 'react-i18next';
import * as S from 'components/shared/elements/StyledComponents/PageWithLeftSidebar';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { fetchAlertCounts } from 'redux/thunks';
import { getAlertCounts, getAlertCountsFetchingStatus } from 'redux/selectors';
import { useQueryParams } from 'lib/hooks';
import { type AlertsQuery, defaultAlertsQuery } from 'components/Alerts/common';
import Filters from './Filters/Filters';
import AlertsTabs from './AlertsTabs/AlertsTabs';
import AlertsList from './AlertsList/AlertsList';

// Mirrors the Activity page: a left filter sidebar plus a results pane whose tabs are query-param
// driven. The view counts react to the same filters as the list (datasource / namespace / tag /
// owner / status / period) but NOT to the selected tab, so `type` and the paging params are dropped
// before fetching counts.
const Alerts: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { queryParams } = useQueryParams<AlertsQuery>(defaultAlertsQuery);

  const counts = useAppSelector(getAlertCounts);
  const { isLoading: isCountsFetching } = useAppSelector(getAlertCountsFetchingStatus);

  React.useEffect(() => {
    // Counts react to the filters, not to the selected tab or paging: getAlertCounts returns all
    // four view counts at once, so drop `type`/`page`/`size` from the request.
    dispatch(fetchAlertCounts(omit(queryParams, ['type', 'page', 'size'])));
  }, [queryParams]);

  return (
    <S.MainContainer>
      <S.ContentContainer container spacing={2}>
        <S.LeftSidebarContainer item xs={3}>
          <Filters />
        </S.LeftSidebarContainer>
        <S.ListContainer item xs={9}>
          <Typography variant='h1' sx={{ mb: 2 }}>
            {t('Alerts')}
          </Typography>
          <Grid sx={{ mt: 1 }}>
            <AlertsTabs counts={counts} isCountsFetching={isCountsFetching} />
            <AlertsList />
          </Grid>
        </S.ListContainer>
      </S.ContentContainer>
    </S.MainContainer>
  );
};

export default Alerts;
