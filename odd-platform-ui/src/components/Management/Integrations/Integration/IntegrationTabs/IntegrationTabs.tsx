import React from 'react';
import { type AppTabItem, AppTabs } from 'components/shared/elements';
import { useAppParams } from 'lib/hooks';
import { Grid } from '@mui/material';
import capitalize from 'lodash/capitalize';

interface IntegrationTabsProps {
  titles: string[];
}

const IntegrationTabs: React.FC<IntegrationTabsProps> = ({ titles }) => {
  const { integrationViewType } = useAppParams();

  const [selectedTab, setSelectedTab] = React.useState(0);

  const tabs = React.useMemo<AppTabItem[]>(
    () => titles.map(title => ({ name: capitalize(title), link: title })),
    [titles]
  );

  React.useEffect(() => {
    setSelectedTab(
      integrationViewType ? tabs.findIndex(tab => tab.link === integrationViewType) : 0
    );
  }, [integrationViewType]);

  return (
    <Grid sx={{ mt: 1 }}>
      <AppTabs
        type='primary'
        items={tabs}
        selectedTab={selectedTab}
        handleTabChange={() => {}}
      />
    </Grid>
  );
};

export default IntegrationTabs;
