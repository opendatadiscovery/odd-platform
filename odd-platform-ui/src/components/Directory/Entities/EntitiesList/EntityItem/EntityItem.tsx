import React, { type FC } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import type { DataEntity } from 'generated-sources';
import {
  EntityClassItem,
  Table,
  DataEntityDetailsPreview,
  MetadataStale,
} from 'components/shared/elements';
import { DataEntityClassTypeLabelMap } from 'lib/constants';
import { useAppDateTime } from 'lib/hooks';
import { dataEntityDetailsPath, useDirectoryRouteParams } from 'routes';

interface EntityItemProps {
  name: DataEntity['internalName'] | DataEntity['externalName'];
  type: DataEntity['type'];
  id: DataEntity['id'];
  entityClasses: DataEntity['entityClasses'];
  ownership: DataEntity['ownership'];
  createdAtDS: DataEntity['sourceCreatedAt'];
  updatedAtDS: DataEntity['sourceUpdatedAt'];
  lastIngestedAt: DataEntity['lastIngestedAt'];
  isStale: DataEntity['isStale'];
  flexMap: Record<string, string>;
}

const EntityItem: FC<EntityItemProps> = ({
  name,
  entityClasses,
  createdAtDS,
  type,
  updatedAtDS,
  lastIngestedAt,
  isStale,
  ownership,
  flexMap,
  id,
}) => {
  const { typeId } = useDirectoryRouteParams();
  const { dataEntityFormattedDateTime } = useAppDateTime();

  return (
    <Link to={dataEntityDetailsPath(id)}>
      <Table.RowContainer>
        <Table.Cell $flex={flexMap.name}>
          <Grid
            container
            justifyContent='space-between'
            alignItems='center'
            wrap='nowrap'
          >
            <Box
              sx={{
                overflow: 'hidden',
                justifyContent: 'flex-start',
                mr: 1,
                display: 'flex',
                flexWrap: 'nowrap',
              }}
            >
              <Box display='flex' flexWrap='nowrap' alignItems='center' overflow='hidden'>
                <MetadataStale isStale={isStale} lastIngestedAt={lastIngestedAt} />
                <Typography ml={0.5} variant='body1' noWrap title={name}>
                  {name}
                </Typography>
              </Box>
              <Box display='flex' flexWrap='nowrap' mr={1} justifyContent='flex-start'>
                {entityClasses?.map(entityClass => (
                  <EntityClassItem
                    sx={{ ml: 0.5 }}
                    key={entityClass.id}
                    entityClassName={entityClass.name}
                  />
                ))}
              </Box>
            </Box>
            <DataEntityDetailsPreview dataEntityId={id} />
          </Grid>
        </Table.Cell>
        {!typeId && (
          <Table.Cell $flex={flexMap.type}>
            {DataEntityClassTypeLabelMap.get(type.name)?.normal ?? type.name}
          </Table.Cell>
        )}
        <Table.Cell $flex={flexMap.owner}>
          <Grid container direction='column' alignItems='flex-start'>
            {ownership?.map(owner => (
              <Typography key={owner.owner.id} variant='body1'>
                {owner.owner.name}
              </Typography>
            ))}
          </Grid>
        </Table.Cell>
        <Table.Cell $flex={flexMap.createdAt}>
          {createdAtDS && (
            <Typography variant='body1'>
              {dataEntityFormattedDateTime(createdAtDS.getTime())}
            </Typography>
          )}
        </Table.Cell>
        <Table.Cell $flex={flexMap.updatedAt}>
          {updatedAtDS && (
            <Typography variant='body1'>
              {dataEntityFormattedDateTime(updatedAtDS.getTime())}
            </Typography>
          )}
        </Table.Cell>
      </Table.RowContainer>
    </Link>
  );
};

export default EntityItem;
