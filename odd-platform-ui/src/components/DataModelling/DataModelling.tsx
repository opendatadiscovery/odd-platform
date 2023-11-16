import React, { useCallback, useMemo, useState } from 'react';
import type { AppTabItem } from 'components/shared/elements';
import { AppTabs, Button, PageWithLeftSidebar } from 'components/shared/elements';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import QueryExampleSearchInput from './QueryExampleSearchInput/QueryExampleSearchInput';
import { AddIcon } from '../shared/icons';

const DataModelling: React.FC = () => {
  const { t } = useTranslation();
  const tabs = useMemo<AppTabItem[]>(
    () => [
      {
        name: t('Query Examples'),
        value: 'query-examples',
      },
      {
        name: t('Relationships'),
        value: 'relationships',
        disabled: true,
      },
    ],
    [t]
  );
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = useCallback(() => {
    setSelectedTab(prev => (prev === 0 ? 1 : 0));
  }, []);

  return (
    <PageWithLeftSidebar.MainContainer>
      <Grid container px={2} rowSpacing={2}>
        <Grid
          item
          display='flex'
          justifyContent='space-between'
          alignItems='center'
          xs={12}
        >
          <QueryExampleSearchInput />

          <Button
            buttonType='main-lg'
            startIcon={<AddIcon />}
            text={t('Add query example')}
          />
        </Grid>
        <Grid item xs={12}>
          <AppTabs
            type='primary'
            items={tabs}
            selectedTab={selectedTab}
            handleTabChange={handleTabChange}
          />
        </Grid>
      </Grid>
    </PageWithLeftSidebar.MainContainer>
  );
};

export default DataModelling;
