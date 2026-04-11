import React from 'react';
import { Typography } from '@mui/material';
import { AppTooltip } from 'components/shared/elements';
import { datasetStructureFieldPath } from 'routes/dataEntitiesRoutes';
import { Link } from 'react-router-dom';
import * as S from './OverviewRelationshipStatsStyles';

interface RelationshipKeyProps {
  name: string | undefined;
  oddrn: string;
  id: number | undefined;
  dataentityId: number;
}

const RelationshipKey: React.FC<RelationshipKeyProps> = ({
  name,
  oddrn,
  id,
  dataentityId,
}) => {
  if (!id) {
    return (
      <AppTooltip
        key={oddrn}
        title={<S.Tooltip>{oddrn}</S.Tooltip>}
        checkForOverflow={false}
      >
        <Typography variant='h4'>{name}</Typography>
      </AppTooltip>
    );
  }

  return (
    <AppTooltip
      key={oddrn}
      title={<S.Tooltip>{oddrn}</S.Tooltip>}
      checkForOverflow={false}
    >
      <Link to={datasetStructureFieldPath(dataentityId, id)}>
        <Typography variant='h4' color='texts.link'>
          {name}
        </Typography>
      </Link>
    </AppTooltip>
  );
};

export default RelationshipKey;
