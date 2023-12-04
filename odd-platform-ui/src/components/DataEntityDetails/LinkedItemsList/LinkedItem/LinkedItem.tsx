import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import type { DataEntity } from 'generated-sources';
import { useAppDateTime } from 'lib/hooks';
import { MetadataStale } from 'components/shared/elements';
import { useIsEmbeddedPath } from 'lib/hooks/useAppPaths/useIsEmbeddedPath';
import { dataEntityDetailsPath } from 'routes';
import { Container, ItemLink, ColContainer } from './LinkedItemStyles';

interface LinkedItemProps {
  linkedItem: DataEntity;
}

const LinkedItem: React.FC<LinkedItemProps> = ({ linkedItem }) => {
  const { linkedEntityFormattedDateTime, formatDistanceToNowStrict } = useAppDateTime();
  const { updatePath } = useIsEmbeddedPath();
  const detailsLink = updatePath(dataEntityDetailsPath(linkedItem.id));

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
          <Box display='flex' flexWrap='nowrap' alignItems='center' overflow='hidden'>
            <MetadataStale
              isStale={linkedItem.isStale}
              lastIngestedAt={linkedItem.lastIngestedAt}
            />
            <Typography
              ml={0.5}
              variant='body1'
              noWrap
              title={linkedItem.internalName || linkedItem.externalName}
            >
              {linkedItem.internalName || linkedItem.externalName}
            </Typography>
          </Box>
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
              linkedItem.sourceCreatedAt &&
              linkedEntityFormattedDateTime(linkedItem.sourceCreatedAt.getTime())
            }
            noWrap
          >
            {linkedItem.sourceCreatedAt &&
              linkedEntityFormattedDateTime(linkedItem.sourceCreatedAt.getTime())}
          </Typography>
        </ColContainer>
        <ColContainer item $colType='colxs'>
          <Typography
            variant='body1'
            title={
              linkedItem.sourceUpdatedAt &&
              formatDistanceToNowStrict(linkedItem.sourceUpdatedAt, { addSuffix: true })
            }
            noWrap
          >
            {linkedItem.sourceUpdatedAt &&
              formatDistanceToNowStrict(linkedItem.sourceUpdatedAt, { addSuffix: true })}
          </Typography>
        </ColContainer>
      </Container>
    </ItemLink>
  );
};

export default LinkedItem;
