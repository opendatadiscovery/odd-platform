import React from 'react';
import type { DataEntity } from 'generated-sources';
import { Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { dataEntityDetailsPath } from 'routes/dataEntitiesRoutes';

interface RelationshipDatasetInfoProps {
  dataEntityId?: DataEntity['id'];
  oddrn: DataEntity['oddrn'];
}

export const RelationshipDatasetInfo = ({
  dataEntityId,
  oddrn,
}: RelationshipDatasetInfoProps) =>
  dataEntityId ? (
    <Link to={dataEntityDetailsPath(dataEntityId)}>
      <Typography variant='body1' color='button.link.normal.color' fontWeight={500}>
        {oddrn.split('/').pop()}
      </Typography>
    </Link>
  ) : (
    <Typography variant='body1'>{oddrn}</Typography>
  );
