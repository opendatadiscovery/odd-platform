import React from 'react';
import type { DataEntity } from 'generated-sources';
import { Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { dataEntityDetailsPath } from 'routes/dataEntitiesRoutes';

interface RelationshipDatasetInfoProps {
  dataEntityId?: DataEntity['id'];
  oddrn: DataEntity['oddrn'];
  name: string;
}

export const RelationshipDatasetInfo = ({
  dataEntityId,
  oddrn,
  name,
}: RelationshipDatasetInfoProps) =>
  dataEntityId ? (
    <Link to={dataEntityDetailsPath(dataEntityId)} style={{ width: '100%' }}>
      <Typography
        variant='body1'
        color='button.link.normal.color'
        fontWeight={500}
        sx={{ textOverflow: 'ellipsis', overflow: 'hidden' }}
      >
        {name}
      </Typography>
    </Link>
  ) : (
    <Typography variant='body1'>{oddrn}</Typography>
  );
