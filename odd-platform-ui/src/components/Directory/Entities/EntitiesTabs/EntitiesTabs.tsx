import React, { type FC } from 'react';
import { Grid } from '@mui/material';
import type { DataEntityType } from 'generated-sources';
import { AppTabs, type AppTabItem } from 'components/shared/elements';
import { DataEntityClassTypeLabelMap } from 'lib/constants';
import { directoryDataSourcePath, useDirectoryRouteParams } from 'routes';

interface EntitiesListTabsProps {
  types: DataEntityType[];
}

const EntitiesTabs: FC<EntitiesListTabsProps> = ({ types }) => {
  const { typeId, dataSourceTypePrefix, dataSourceId } = useDirectoryRouteParams();
  const [selectedTab, setSelectedTab] = React.useState(0);

  const tabs = React.useMemo<AppTabItem[]>(() => {
    const dynamicTabs = types.map(({ id, name }) => ({
      name: DataEntityClassTypeLabelMap.get(name)!.plural,
      link: directoryDataSourcePath(dataSourceTypePrefix, dataSourceId, id),
      value: id,
    }));

    return [
      {
        name: 'All',
        link: directoryDataSourcePath(dataSourceTypePrefix, dataSourceId, 'all'),
        value: 'all',
      },
      ...dynamicTabs,
    ];
  }, [types, dataSourceTypePrefix, dataSourceId]);

  React.useEffect(() => {
    setSelectedTab(
      typeId ? tabs.findIndex(tab => String(tab.value) === String(typeId)) : 0
    );
  }, [tabs, typeId]);

  return (
    <Grid sx={{ py: 1.25, my: 1 }}>
      <AppTabs
        type='primary'
        items={tabs}
        selectedTab={selectedTab}
        handleTabChange={() => {}}
      />
    </Grid>
  );
};

export default EntitiesTabs;
