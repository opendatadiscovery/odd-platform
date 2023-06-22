import React, { type FC, useCallback } from 'react';
import type { DataEntity, DataEntityBaseObject } from 'generated-sources';
import { useAppDateTime, useAppPaths } from 'lib/hooks';
import { Box, Grid, Typography } from '@mui/material';
import {
  Button,
  EntityClassItem,
  EntityTypeItem,
  Table,
  TruncatedList,
} from 'components/shared/elements';
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

  const ownersEllipsis = useCallback(
    (isExpanded: boolean) => (
      <Button
        buttonType='link-m'
        text={isExpanded ? 'Hide' : 'Show more'}
        onClick={e => e.preventDefault()}
      />
    ),
    []
  );

  return (
    <Link to={dataEntityOverviewPath(id)}>
      <Table.RowContainer>
        <Table.Cell $flex={flexMap.name}>
          <Grid
            container
            justifyContent='space-between'
            alignItems='center'
            wrap='nowrap'
            overflow='hidden'
          >
            <Box
              sx={{
                overflow: 'hidden',
                justifyContent: 'flex-start',
                alignItems: 'center',
                mr: 1,
                display: 'flex',
                flexWrap: 'nowrap',
              }}
            >
              {isUpperGroup && <TriangularUnionIcon />}
              <Typography variant='body1' noWrap title={name} ml={1}>
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
          </Grid>
          <EntityTypeItem sx={{ ml: 1 }} entityTypeName={type.name} />
        </Table.Cell>
        <Table.Cell $flex={flexMap.owner}>
          <TruncatedList items={ownership ?? []} lines={5} ellipsis={ownersEllipsis}>
            {owner => (
              <Typography key={owner.owner.id} variant='body1'>
                {owner.owner.name}
              </Typography>
            )}
          </TruncatedList>
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
