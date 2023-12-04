import React, { type FC } from 'react';
import type { DataSourceType } from 'generated-sources';
import { DatasourceLogo, IconicInfoBadge } from 'components/shared/elements';
import { directoryDataSourcePath } from 'routes';
import { useIsEmbeddedPath } from 'lib/hooks/useAppPaths/useIsEmbeddedPath';

interface DirectoryItemProps {
  name: DataSourceType['name'];
  prefix: DataSourceType['prefix'];
  entitiesCount: DataSourceType['entitiesCount'];
}

const DirectoryItem: FC<DirectoryItemProps> = ({ name, entitiesCount, prefix }) => {
  const { updatePath } = useIsEmbeddedPath();

  return (
    <IconicInfoBadge
      name={name}
      count={entitiesCount}
      to={updatePath(directoryDataSourcePath(prefix))}
      icon={
        <DatasourceLogo
          name={prefix}
          width={24}
          padding={0.5}
          backgroundColor='default'
        />
      }
    />
  );
};

export default DirectoryItem;
