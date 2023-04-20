import React from 'react';
import { getMetadataValue } from 'lib/helpers';
import LabeledInfoItem from 'components/shared/elements/LabeledInfoItem/LabeledInfoItem';
import type { MetadataFieldValue } from 'generated-sources';
import { useAppDateTime } from 'lib/hooks';
import type { GridSize } from '@mui/material';

interface MetadataItemProps {
  metadata: MetadataFieldValue;
  labelWidth?: GridSize;
}
const MetadataItem: React.FC<MetadataItemProps> = ({ metadata, labelWidth = 4 }) => {
  const { metadataFormattedDateTime } = useAppDateTime();

  return (
    <LabeledInfoItem
      key={metadata.field.id}
      inline
      label={metadata.field.name}
      labelWidth={labelWidth}
    >
      {getMetadataValue(metadata.field, metadata.value, metadataFormattedDateTime)}
    </LabeledInfoItem>
  );
};

export default MetadataItem;
