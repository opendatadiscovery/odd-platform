import React, { type FC } from 'react';
import { Typography } from '@mui/material';
import AppTooltip from 'components/shared/elements/AppTooltip/AppTooltip';
import { useAppDateTime } from 'lib/hooks';
import StaleIcon from 'components/shared/icons/StaleIcon';

interface MetadataStaleProps {
  isStale: boolean;
  lastIngestedAt?: Date | number;
}

const MetadataStale: FC<MetadataStaleProps> = ({ isStale, lastIngestedAt }) => {
  const { formatDistanceToNow } = useAppDateTime();

  const text =
    lastIngestedAt !== undefined
      ? `Ingested at platform ${formatDistanceToNow(lastIngestedAt, { addSuffix: true })}`
      : ``;

  return isStale ? (
    <AppTooltip
      childSx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      title={
        <Typography variant='subtitle2' px={1} py={0.5}>
          {text}
        </Typography>
      }
    >
      <StaleIcon />
    </AppTooltip>
  ) : null;
};

export default MetadataStale;
