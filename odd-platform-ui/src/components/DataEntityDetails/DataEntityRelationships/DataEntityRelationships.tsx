import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
import {
  EmptyContentPlaceholder,
  RelationshipListHeader,
  RelationshipSkeleton,
  RelationshipListItem,
} from 'components/shared/elements';
import { useGetDatasetRelationships } from 'lib/hooks/api';
import { useDataEntityRouteParams } from 'routes';
import { RelationshipsType } from 'generated-sources';

const DataEntityRelationships: React.FC = () => {
  const { dataEntityId } = useDataEntityRouteParams();
  const { data, isLoading } = useGetDatasetRelationships({
    dataEntityId,
    type: RelationshipsType.ALL,
  });

  const relationshipDetailsList = useMemo(() => data?.items ?? [], [data?.items]);

  const isEmpty = useMemo(
    () => relationshipDetailsList.length === 0 && !isLoading,
    [relationshipDetailsList.length, isLoading]
  );

  return (
    <Grid container gap={2} mt={2}>
      <Grid item xs={12}>
        <RelationshipListHeader />
        {relationshipDetailsList.map(relationshipDetails => (
          <RelationshipListItem
            relationshipDetails={relationshipDetails}
            key={relationshipDetails.id}
          />
        ))}
        {isLoading && <RelationshipSkeleton />}
        {isEmpty && <EmptyContentPlaceholder />}
      </Grid>
    </Grid>
  );
};

export default DataEntityRelationships;
