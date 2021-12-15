import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import {
  DataEntityDetails,
  DataEntityTypeNameEnum,
} from 'generated-sources';
import { dataEntityDetailsPath } from 'lib/paths';
import EntityTypeItem from 'components/shared/EntityTypeItem/EntityTypeItem';
import AppButton from 'components/shared/AppButton/AppButton';
import TriangularUnionIcon from 'components/shared/Icons/TriangularUnionIcon';
import EntitiesListModal from 'components/shared/EntitiesListModal/EntitiesListModal';
import { StatIconContainer } from './OverviewEntityGroupStatsStyles';

interface OverviewEntityGroupStatsProps {
  dataEntityGroupName: string;
  entities: DataEntityDetails['entities'];
  entityGroups: DataEntityDetails['dataEntityGroups'];
}

const OverviewEntityGroupStats: React.FC<OverviewEntityGroupStatsProps> = ({
  dataEntityGroupName,
  entities,
  entityGroups,
}) => (
  <Grid container>
    <Grid item xs={12} sx={{ mb: 1.25 }}>
      <EntityTypeItem
        typeName={DataEntityTypeNameEnum.ENTITY_GROUP}
        fullName
      />
    </Grid>
    <Grid
      item
      container
      xs={6}
      alignItems="flex-start"
      alignContent="flex-start"
    >
      <Grid item container xs={12} alignItems="baseline">
        <Typography variant="h2" sx={{ mr: 0.5 }}>
          {entities?.length || 0}
        </Typography>
        <Typography variant="body1" color="texts.hint">
          entities
        </Typography>
      </Grid>
      <Grid
        item
        container
        xs={12}
        direction="column"
        alignItems="flex-start"
        sx={{ mt: 1 }}
      >
        {entities?.slice(0, 5).map(entity => (
          <AppButton
            key={entity.id}
            size="medium"
            color="tertiary"
            sx={{ my: 0.25 }}
          >
            <Link to={dataEntityDetailsPath(entity.id)}>
              {entity.internalName || entity.externalName}
            </Link>
          </AppButton>
        ))}
        {entities && entities?.length > 5 ? (
          <EntitiesListModal
            entities={entities}
            labelFor="Entities"
            dataEntityName={dataEntityGroupName}
            openBtnEl={
              <AppButton size="medium" color="tertiary" sx={{ my: 0.25 }}>
                Show All
              </AppButton>
            }
          />
        ) : null}
      </Grid>
    </Grid>
    <Grid
      item
      container
      xs={6}
      alignItems="flex-start"
      alignContent="flex-start"
    >
      <Grid item container xs={12} alignItems="baseline">
        <StatIconContainer sx={{ mr: 1 }}>
          <TriangularUnionIcon />
        </StatIconContainer>
        <Typography variant="h2" sx={{ mr: 0.5 }}>
          {entityGroups?.length || 0}
        </Typography>
        <Typography variant="body1" color="texts.hint">
          upper groups
        </Typography>
      </Grid>
      <Grid
        item
        container
        xs={12}
        direction="column"
        alignItems="flex-start"
        sx={{ mt: 1 }}
      >
        {entityGroups?.slice(0, 5).map(entityGroup => (
          <AppButton
            key={entityGroup.id}
            sx={{ my: 0.25 }}
            size="medium"
            color="tertiary"
          >
            <Link to={dataEntityDetailsPath(entityGroup.id)}>
              {entityGroup.internalName || entityGroup.externalName}
            </Link>
          </AppButton>
        ))}
        {entityGroups && entityGroups?.length > 5 ? (
          <EntitiesListModal
            entities={entityGroups}
            labelFor="Upper groups"
            dataEntityName={dataEntityGroupName}
            openBtnEl={
              <AppButton size="medium" color="tertiary" sx={{ my: 0.25 }}>
                Show All
              </AppButton>
            }
          />
        ) : null}
      </Grid>
    </Grid>
  </Grid>
);

export default OverviewEntityGroupStats;
