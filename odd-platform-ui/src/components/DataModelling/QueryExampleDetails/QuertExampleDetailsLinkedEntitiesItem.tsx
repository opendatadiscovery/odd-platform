import type { DataEntity } from 'generated-sources';
import { useAppDateTime } from 'lib/hooks';
import { Box, Grid, Typography } from '@mui/material';
import { EntityClassItem, MetadataStale } from 'components/shared/elements';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataEntityDetailsPath } from 'routes';

interface QueryExampleDetailsLinkedEntitiesItemProps {
  entity: DataEntity;
}

const QueryExampleDetailsLinkedEntitiesItem = ({
  entity,
}: QueryExampleDetailsLinkedEntitiesItemProps) => {
  const { linkedEntityFormattedDateTime, formatDistanceToNowStrict } = useAppDateTime();
  const navigate = useNavigate();
  const onClick = useCallback(() => {
    navigate(dataEntityDetailsPath(entity.id));
  }, [entity.id, navigate]);

  return (
    <Grid
      onClick={onClick}
      container
      sx={theme => ({
        borderBottom: `1px solid ${theme.palette.divider}`,
        padding: theme.spacing(1.25, 0),
        ':hover': {
          backgroundColor: `${theme.palette.backgrounds.primary}`,
          cursor: 'pointer',
        },
      })}
      wrap='nowrap'
    >
      <Grid container pl={1} size={2}>
        <Box display='flex' flexWrap='nowrap' alignItems='center' overflow='hidden'>
          <MetadataStale
            isStale={entity.isStale}
            lastIngestedAt={entity.lastIngestedAt}
          />
          <Typography
            ml={0.5}
            variant='body1'
            noWrap
            title={entity.internalName ?? entity.externalName}
          >
            {entity.internalName ?? entity.externalName}
          </Typography>
          {entity.entityClasses?.map(entityClass => (
            <EntityClassItem
              sx={{ ml: 0.5 }}
              key={entityClass.id}
              entityClassName={entityClass.name}
            />
          ))}
        </Box>
      </Grid>
      <Grid container pl={1} size={4}>
        <Typography variant='body1' title={entity.dataSource.namespace?.name} noWrap>
          {entity.dataSource.namespace?.name}
        </Typography>
      </Grid>
      <Grid pl={1} size={2}>
        <Typography variant='body1' title={entity.dataSource?.name} noWrap>
          {entity.dataSource?.name}
        </Typography>
      </Grid>
      <Grid pl={1} size={2}>
        <Grid container direction='column' alignItems='flex-start'>
          {entity.ownership?.map(ownership => (
            <Grid key={ownership.id}>
              <Typography variant='body1' title={ownership.owner.name} noWrap>
                {ownership.owner.name}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Grid pl={1} size={1}>
        <Typography
          variant='body1'
          title={
            entity.sourceCreatedAt &&
            linkedEntityFormattedDateTime(entity.sourceCreatedAt.getTime())
          }
          noWrap
        >
          {entity.sourceCreatedAt &&
            linkedEntityFormattedDateTime(entity.sourceCreatedAt.getTime())}
        </Typography>
      </Grid>
      <Grid pl={1} size={1}>
        <Typography
          variant='body1'
          title={
            entity.sourceUpdatedAt &&
            formatDistanceToNowStrict(entity.sourceUpdatedAt, { addSuffix: true })
          }
          noWrap
        >
          {entity.sourceUpdatedAt &&
            formatDistanceToNowStrict(entity.sourceUpdatedAt, {
              addSuffix: true,
            })}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default QueryExampleDetailsLinkedEntitiesItem;
