import { Grid, Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { DataEntityRef } from 'generated-sources';
import EntityTypeItem from 'components/shared/EntityTypeItem/EntityTypeItem';
import AlertIcon from 'components/shared/Icons/AlertIcon';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import { dataEntityDetailsPath } from 'lib/paths';
import { StylesType } from './DataEntityListStyles';

interface OverviewDataEntityProps extends StylesType {
  dataEntitiesList: DataEntityRef[];
  entityListName: string;
  entityListIcon?: JSX.Element;
  isFetching: boolean;
}

const DataEntityList: React.FC<OverviewDataEntityProps> = ({
  classes,
  dataEntitiesList,
  entityListName,
  entityListIcon,
  isFetching,
}) => (
  <Grid item className={classes.container}>
    <Typography variant="h4" className={classes.sectionCaption}>
      {entityListIcon}
      {entityListName}
    </Typography>
    <ul className={classes.listLinks}>
      {dataEntitiesList.map(item => (
        <li key={item.id}>
          <Grid container alignItems="center" wrap="nowrap">
            <Link
              to={dataEntityDetailsPath(item.id)}
              className={classes.listLink}
            >
              {item.hasAlerts ? (
                <AlertIcon className={classes.alert} />
              ) : null}
              <Typography
                noWrap
                title={item.internalName || item.externalName}
              >
                {item.internalName || item.externalName}
              </Typography>
            </Link>
            {item.types?.map(type => (
              <EntityTypeItem key={type.id} typeName={type.name} />
            ))}
          </Grid>
        </li>
      ))}
      {!isFetching && !dataEntitiesList.length ? (
        <EmptyContentPlaceholder />
      ) : null}
    </ul>
  </Grid>
);

export default DataEntityList;
