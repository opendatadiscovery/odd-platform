import React, { type FC } from 'react';
import type { DataEntity } from 'generated-sources';
import {
  EntityClassItem,
  Table,
  DataEntityDetailsPreview,
} from 'components/shared/elements';
import { DataEntityClassTypeLabelMap } from 'lib/constants';
import { Box, Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAppDateTime, useAppParams, useAppPaths } from 'lib/hooks';

interface EntityItemProps {
  name: DataEntity['internalName'] | DataEntity['externalName'];
  type: DataEntity['type'];
  id: DataEntity['id'];
  entityClasses: DataEntity['entityClasses'];
  ownership: DataEntity['ownership'];
  createdAt: DataEntity['createdAt'];
  updatedAt: DataEntity['updatedAt'];
  flexMap: Record<string, string>;
}

const EntityItem: FC<EntityItemProps> = ({
  name,
  entityClasses,
  createdAt,
  type,
  updatedAt,
  ownership,
  flexMap,
  id,
}) => {
  const { typeId } = useAppParams();
  const { dataEntityOverviewPath } = useAppPaths();
  const { dataEntityFormattedDateTime } = useAppDateTime();

  return (
    <Link to={dataEntityOverviewPath(id)}>
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
              <Typography variant='body1' noWrap title={name}>
                {name}
              </Typography>
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
            {DataEntityClassTypeLabelMap.get(type.name)!.normal}
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
          {createdAt && (
            <Typography variant='body1'>
              {dataEntityFormattedDateTime(createdAt.getTime())}
            </Typography>
          )}
        </Table.Cell>
        <Table.Cell $flex={flexMap.updatedAt}>
          {updatedAt && (
            <Typography variant='body1'>
              {dataEntityFormattedDateTime(updatedAt.getTime())}
            </Typography>
          )}
        </Table.Cell>
      </Table.RowContainer>
    </Link>
  );
};

export default EntityItem;
