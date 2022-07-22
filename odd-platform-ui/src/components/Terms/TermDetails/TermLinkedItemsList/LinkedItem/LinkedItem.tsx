import React from 'react';
import { Grid, Typography } from '@mui/material';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { DataEntity } from 'generated-sources';
import EntityClassItem from 'components/shared/EntityClassItem/EntityClassItem';
import { useAppPaths } from 'lib/hooks';
import { TermLinkedItemsColContainer } from '../LinkedItemsListStyles';
import { Container, ItemLink, NameContainer } from './LinkedItemStyles';

interface LinkedItemProps {
  linkedItem: DataEntity;
}

const LinkedItem: React.FC<LinkedItemProps> = ({ linkedItem }) => {
  const { dataEntityDetailsPath } = useAppPaths();
  const detailsLink = dataEntityDetailsPath(linkedItem.id);

  return (
    <ItemLink to={detailsLink}>
      <Container container>
        <TermLinkedItemsColContainer
          $colType="colmd"
          item
          container
          justifyContent="space-between"
          wrap="nowrap"
        >
          <NameContainer container item>
            <Typography
              variant="body1"
              noWrap
              title={linkedItem.internalName || linkedItem.externalName}
            >
              {linkedItem.internalName || linkedItem.externalName}
            </Typography>
          </NameContainer>
          <Grid
            container
            item
            justifyContent="flex-end"
            wrap="nowrap"
            flexBasis={0}
          >
            {linkedItem.entityClasses?.map(entityClass => (
              <EntityClassItem
                sx={{ ml: 0.5 }}
                key={entityClass.id}
                entityClassName={entityClass.name}
              />
            ))}
          </Grid>
        </TermLinkedItemsColContainer>
        <TermLinkedItemsColContainer item $colType="collg">
          <Typography
            variant="body1"
            title={linkedItem.dataSource.namespace?.name}
            noWrap
          >
            {linkedItem.dataSource.namespace?.name}
          </Typography>
        </TermLinkedItemsColContainer>
        <TermLinkedItemsColContainer item $colType="colsm">
          <Typography
            variant="body1"
            title={linkedItem.dataSource?.name}
            noWrap
          >
            {linkedItem.dataSource?.name}
          </Typography>
        </TermLinkedItemsColContainer>
        <TermLinkedItemsColContainer item $colType="colsm">
          <Grid container direction="column" alignItems="flex-start">
            {linkedItem.ownership?.map(ownership => (
              <Grid item key={ownership.id}>
                <Typography
                  variant="body1"
                  title={ownership.owner.name}
                  noWrap
                >
                  {ownership.owner.name}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </TermLinkedItemsColContainer>
        <TermLinkedItemsColContainer item $colType="colxs">
          <Typography
            variant="body1"
            title={
              linkedItem.createdAt
                ? format(linkedItem.createdAt, 'd MMM yyyy')
                : undefined
            }
            noWrap
          >
            {linkedItem.createdAt
              ? format(linkedItem.createdAt, 'd MMM yyyy')
              : null}
          </Typography>
        </TermLinkedItemsColContainer>
        <TermLinkedItemsColContainer item $colType="colxs">
          <Typography
            variant="body1"
            title={
              linkedItem.updatedAt
                ? formatDistanceToNowStrict(linkedItem.updatedAt, {
                    addSuffix: true,
                  })
                : undefined
            }
            noWrap
          >
            {linkedItem.updatedAt
              ? formatDistanceToNowStrict(linkedItem.updatedAt, {
                  addSuffix: true,
                })
              : null}
          </Typography>
        </TermLinkedItemsColContainer>
      </Container>
    </ItemLink>
  );
};

export default LinkedItem;
