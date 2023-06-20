import React, { type FC } from 'react';
import type { DataEntity, DataEntityBaseObject } from 'generated-sources';
import { useAppDateTime, useAppPaths } from 'lib/hooks';
import { Box, Grid, Typography } from '@mui/material';
import { EntityClassItem, Table } from 'components/shared/elements';
import { DataEntityClassTypeLabelMap } from 'lib/constants';
import { Link } from 'react-router-dom';
import { TriangularUnionIcon } from 'components/shared/icons';

interface EntityGroupItemProps {
  isUpperGroup: boolean;
  name: DataEntity['internalName'] | DataEntity['externalName'];
  id: DataEntityBaseObject['id'];
  entityClasses: DataEntityBaseObject['entityClasses'];
  type: DataEntityBaseObject['type'];
  ownership: DataEntityBaseObject['ownership'];
  createdAt: DataEntityBaseObject['createdAt'];
  updatedAt: DataEntityBaseObject['updatedAt'];
  flexMap: Record<string, string>;
}

const EntityGroupItem: FC<EntityGroupItemProps> = ({
  isUpperGroup,
  entityClasses,
  createdAt,
  type,
  updatedAt,
  ownership,
  flexMap,
  id,
  name,
}) => {
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
                {entityClasses &&
                  entityClasses.map(entityClass => (
                    <EntityClassItem
                      sx={{ ml: 0.5 }}
                      key={entityClass.id}
                      entityClassName={entityClass.name}
                    />
                  ))}
              </Box>
            </Box>
            {isUpperGroup && <TriangularUnionIcon />}
          </Grid>
        </Table.Cell>
        <Table.Cell $flex={flexMap.type}>
          {DataEntityClassTypeLabelMap.get(type.name)!.normal}
        </Table.Cell>
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

export default EntityGroupItem;
