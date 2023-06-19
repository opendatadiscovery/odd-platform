import React, { type FC } from 'react';
import type { DataEntityDomain } from 'generated-sources';
import { Box } from '@mui/material';
import { useAppPaths } from 'lib/hooks';
import { IconicInfoBadge } from 'components/shared/elements';
import { FolderIcon } from 'components/shared/icons';

interface DomainItemProps {
  domain: DataEntityDomain['domain'];
  childrenCount: DataEntityDomain['childrenCount'];
}

const DomainItem: FC<DomainItemProps> = ({ domain, childrenCount }) => {
  const { dataEntityOverviewPath } = useAppPaths();

  return (
    <IconicInfoBadge
      name={domain.internalName ?? domain.externalName ?? ''}
      count={childrenCount}
      to={dataEntityOverviewPath(domain.id)}
      icon={
        <Box
          sx={{
            backgroundColor: 'white',
            padding: 0.5,
            borderRadius: 2,
            display: 'flex',
          }}
        >
          <FolderIcon width={24} height={24} />
        </Box>
      }
    />
  );
};

export default DomainItem;
