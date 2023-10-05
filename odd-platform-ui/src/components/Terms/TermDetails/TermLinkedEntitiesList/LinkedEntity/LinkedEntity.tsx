import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import type { DataEntity } from 'generated-sources';
import { EntityClassItem, MetadataStale } from 'components/shared/elements';
import { useAppDateTime, useAppPaths } from 'lib/hooks';
import { TermLinkedEntitiesColContainer } from '../LinkedEntitiesListStyles';
import { Container, EntityLink, NameContainer } from './LinkedEntityStyles';

interface LinkedEntityProps {
  linkedEntity: DataEntity;
}

const LinkedEntity: React.FC<LinkedEntityProps> = ({ linkedEntity }) => {
  const { dataEntityOverviewPath } = useAppPaths();
  const { linkedEntityFormattedDateTime, formatDistanceToNowStrict } = useAppDateTime();

  const detailsLink = dataEntityOverviewPath(linkedEntity.id);

  return (
    <EntityLink to={detailsLink}>
      <Container container>
        <TermLinkedEntitiesColContainer
          $colType='colmd'
          item
          container
          justifyContent='space-between'
          wrap='nowrap'
        >
          <NameContainer container item>
            <Box display='flex' flexWrap='nowrap' alignItems='center' overflow='hidden'>
              <MetadataStale
                isStale={linkedEntity.isStale}
                lastIngestedAt={linkedEntity.lastIngestedAt}
              />
              <Typography
                ml={0.5}
                variant='body1'
                noWrap
                title={linkedEntity.internalName || linkedEntity.externalName}
              >
                {linkedEntity.internalName || linkedEntity.externalName}
              </Typography>
            </Box>
          </NameContainer>
          <Grid container item justifyContent='flex-end' wrap='nowrap' flexBasis={0}>
            {linkedEntity.entityClasses?.map(entityClass => (
              <EntityClassItem
                sx={{ ml: 0.5 }}
                key={entityClass.id}
                entityClassName={entityClass.name}
              />
            ))}
          </Grid>
        </TermLinkedEntitiesColContainer>
        <TermLinkedEntitiesColContainer item $colType='collg'>
          <Typography
            variant='body1'
            title={linkedEntity.dataSource.namespace?.name}
            noWrap
          >
            {linkedEntity.dataSource.namespace?.name}
          </Typography>
        </TermLinkedEntitiesColContainer>
        <TermLinkedEntitiesColContainer item $colType='colsm'>
          <Typography variant='body1' title={linkedEntity.dataSource?.name} noWrap>
            {linkedEntity.dataSource?.name}
          </Typography>
        </TermLinkedEntitiesColContainer>
        <TermLinkedEntitiesColContainer item $colType='colsm'>
          <Grid container direction='column' alignItems='flex-start'>
            {linkedEntity.ownership?.map(ownership => (
              <Grid item key={ownership.id}>
                <Typography variant='body1' title={ownership.owner.name} noWrap>
                  {ownership.owner.name}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </TermLinkedEntitiesColContainer>
        <TermLinkedEntitiesColContainer item $colType='colxs'>
          <Typography
            variant='body1'
            title={
              linkedEntity.sourceCreatedAt &&
              linkedEntityFormattedDateTime(linkedEntity.sourceCreatedAt.getTime())
            }
            noWrap
          >
            {linkedEntity.sourceCreatedAt &&
              linkedEntityFormattedDateTime(linkedEntity.sourceCreatedAt.getTime())}
          </Typography>
        </TermLinkedEntitiesColContainer>
        <TermLinkedEntitiesColContainer item $colType='colxs'>
          <Typography
            variant='body1'
            title={
              linkedEntity.sourceUpdatedAt &&
              formatDistanceToNowStrict(linkedEntity.sourceUpdatedAt, { addSuffix: true })
            }
            noWrap
          >
            {linkedEntity.sourceUpdatedAt &&
              formatDistanceToNowStrict(linkedEntity.sourceUpdatedAt, {
                addSuffix: true,
              })}
          </Typography>
        </TermLinkedEntitiesColContainer>
      </Container>
    </EntityLink>
  );
};

export default LinkedEntity;
