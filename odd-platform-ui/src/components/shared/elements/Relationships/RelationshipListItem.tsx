import React from 'react';
import type { DataEntityRelationshipDetails } from 'generated-sources';
import { dataEntityDetailsPath } from 'routes';
import { Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { EntityRelationship } from './RelationshipTypes/EntityRelationship';
import { GraphRelationship } from './RelationshipTypes/GraphRelationship';
import * as Table from '../StyledComponents/Table';
import EntityTypeItem from '../EntityTypeItem/EntityTypeItem';
import AppPaper from '../AppPaper/AppPaper';

interface RelationshipListItemProps {
  relationshipDetails: DataEntityRelationshipDetails;
}

const RelationshipListItem = ({ relationshipDetails }: RelationshipListItemProps) => (
  <Table.RowContainer>
    <Table.Cell $flex='0 0 40px'>
      <Link to={dataEntityDetailsPath(relationshipDetails.id)}>
        <Typography variant='caption' color='button.link.normal.color' fontWeight={500}>
          {relationshipDetails.id}
        </Typography>
      </Link>
    </Table.Cell>
    <Table.Cell $flex='1 0 25%'>
      <Typography variant='body1' fontWeight={500}>
        {relationshipDetails.name}
      </Typography>
    </Table.Cell>
    <Table.Cell $flex='1 0 15%'>
      <EntityTypeItem entityTypeName={relationshipDetails.type} />
    </Table.Cell>
    <Table.Cell $flex='1 0 55%'>
      <Grid container justifyContent='space-between' alignItems='center' wrap='nowrap'>
        {relationshipDetails.erdRelationship && (
          <AppPaper elevation={0} sx={theme => ({ p: theme.spacing(2), width: '100%' })}>
            <EntityRelationship
              erdRelationship={relationshipDetails.erdRelationship}
              sourceDataEntity={relationshipDetails.sourceDataEntity}
              targetDataEntity={relationshipDetails.targetDataEntity}
              key={relationshipDetails.erdRelationship.erdRelationshipId}
            />
          </AppPaper>
        )}
        {relationshipDetails.graphRelationship && (
          <AppPaper elevation={0} sx={theme => ({ p: theme.spacing(2), width: '100%' })}>
            <GraphRelationship
              graphRelationship={relationshipDetails.graphRelationship}
              sourceDataEntity={relationshipDetails.sourceDataEntity}
              targetDataEntity={relationshipDetails.targetDataEntity}
              key={relationshipDetails.graphRelationship.graphRelationshipId}
            />
          </AppPaper>
        )}
      </Grid>
    </Table.Cell>
  </Table.RowContainer>
);

export default RelationshipListItem;
