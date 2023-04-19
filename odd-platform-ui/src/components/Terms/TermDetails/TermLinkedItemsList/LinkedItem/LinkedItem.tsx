import React from 'react';
import { Grid, Typography } from '@mui/material';
import type { DataEntity } from 'generated-sources';
import { EntityClassItem } from 'components/shared/elements';
import { useAppDateTime, useAppPaths } from 'lib/hooks';
import { TermLinkedItemsColContainer } from '../LinkedItemsListStyles';
import { Container, ItemLink, NameContainer } from './LinkedItemStyles';

interface LinkedItemProps {
  linkedItem: DataEntity;
}

const LinkedItem: React.FC<LinkedItemProps> = ({ linkedItem }) => {
  const { dataEntityOverviewPath } = useAppPaths();
  const { linkedEntityFormattedDateTime, formatDistanceToNowStrict } = useAppDateTime();

  const detailsLink = dataEntityOverviewPath(linkedItem.id);

  return (
    <ItemLink to={detailsLink}>
      <Container container>
        <TermLinkedItemsColContainer
          $colType='colmd'
          item
          container
          justifyContent='space-between'
          wrap='nowrap'
        >
          <NameContainer container item>
            <Typography
              variant='body1'
              noWrap
              title={linkedItem.internalName || linkedItem.externalName}
            >
              {linkedItem.internalName || linkedItem.externalName}
            </Typography>
          </NameContainer>
          <Grid container item justifyContent='flex-end' wrap='nowrap' flexBasis={0}>
            {linkedItem.entityClasses?.map(entityClass => (
              <EntityClassItem
                sx={{ ml: 0.5 }}
                key={entityClass.id}
                entityClassName={entityClass.name}
              />
            ))}
          </Grid>
        </TermLinkedItemsColContainer>
        <TermLinkedItemsColContainer item $colType='collg'>
          <Typography
            variant='body1'
            title={linkedItem.dataSource.namespace?.name}
            noWrap
          >
            {linkedItem.dataSource.namespace?.name}
          </Typography>
        </TermLinkedItemsColContainer>
        <TermLinkedItemsColContainer item $colType='colsm'>
          <Typography variant='body1' title={linkedItem.dataSource?.name} noWrap>
            {linkedItem.dataSource?.name}
          </Typography>
        </TermLinkedItemsColContainer>
        <TermLinkedItemsColContainer item $colType='colsm'>
          <Grid container direction='column' alignItems='flex-start'>
            {linkedItem.ownership?.map(ownership => (
              <Grid item key={ownership.id}>
                <Typography variant='body1' title={ownership.owner.name} noWrap>
                  {ownership.owner.name}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </TermLinkedItemsColContainer>
        <TermLinkedItemsColContainer item $colType='colxs'>
          <Typography
            variant='body1'
            title={
              linkedItem.createdAt &&
              linkedEntityFormattedDateTime(linkedItem.createdAt.getTime())
            }
            noWrap
          >
            {linkedItem.createdAt &&
              linkedEntityFormattedDateTime(linkedItem.createdAt.getTime())}
          </Typography>
        </TermLinkedItemsColContainer>
        <TermLinkedItemsColContainer item $colType='colxs'>
          <Typography
            variant='body1'
            title={
              linkedItem.updatedAt &&
              formatDistanceToNowStrict(linkedItem.updatedAt, { addSuffix: true })
            }
            noWrap
          >
            {linkedItem.updatedAt &&
              formatDistanceToNowStrict(linkedItem.updatedAt, { addSuffix: true })}
          </Typography>
        </TermLinkedItemsColContainer>
      </Container>
    </ItemLink>
  );
};

export default LinkedItem;
