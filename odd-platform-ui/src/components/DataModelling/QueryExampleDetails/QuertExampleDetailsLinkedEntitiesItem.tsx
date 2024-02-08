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
      <Grid container item xs={2} pl={1}>
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
      <Grid container item xs={4} pl={1}>
        <Typography variant='body1' title={entity.dataSource.namespace?.name} noWrap>
          {entity.dataSource.namespace?.name}
        </Typography>
      </Grid>
      <Grid item xs={2} pl={1}>
        <Typography variant='body1' title={entity.dataSource?.name} noWrap>
          {entity.dataSource?.name}
        </Typography>
      </Grid>
      <Grid item xs={2} pl={1}>
        <Grid container direction='column' alignItems='flex-start'>
          {entity.ownership?.map(ownership => (
            <Grid item key={ownership.id}>
              <Typography variant='body1' title={ownership.owner.name} noWrap>
                {ownership.owner.name}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Grid item xs={1} pl={1}>
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
      <Grid item xs={1} pl={1}>
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
