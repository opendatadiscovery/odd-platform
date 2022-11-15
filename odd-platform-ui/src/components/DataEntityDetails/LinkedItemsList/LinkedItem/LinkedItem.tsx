import React from 'react';
import { Grid, Typography } from '@mui/material';
import { formatDistanceToNowStrict } from 'date-fns';
import { DataEntity } from 'generated-sources';
import { ColContainer } from 'components/Search/Results/ResultsStyles';
import { useAppDateTime, useAppPaths } from 'lib/hooks';
import { Container, ItemLink } from './LinkedItemStyles';

interface LinkedItemProps {
  linkedItem: DataEntity;
}

const LinkedItem: React.FC<LinkedItemProps> = ({ linkedItem }) => {
  const { dataEntityDetailsPath } = useAppPaths();
  const { linkedEntityFormattedDateTime } = useAppDateTime();
  const detailsLink = dataEntityDetailsPath(linkedItem.id);

  return (
    <ItemLink to={detailsLink}>
      <Container container>
        <ColContainer
          $colType='colmd'
          item
          container
          justifyContent='space-between'
          wrap='nowrap'
        >
          <Typography
            variant='body1'
            noWrap
            title={linkedItem.internalName || linkedItem.externalName}
          >
            {linkedItem.internalName || linkedItem.externalName}
          </Typography>
        </ColContainer>
        <ColContainer $colType='collg' item container wrap='wrap' />
        <ColContainer item $colType='colsm'>
          <Grid container direction='column' alignItems='flex-start'>
            {linkedItem.ownership?.map(ownership => (
              <Grid item key={ownership.id}>
                <Typography variant='body1' title={ownership.owner.name} noWrap>
                  {ownership.owner.name}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </ColContainer>
        <ColContainer item $colType='colxs'>
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
        </ColContainer>
        <ColContainer item $colType='colxs'>
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
        </ColContainer>
      </Container>
    </ItemLink>
  );
};

export default LinkedItem;
