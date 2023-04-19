import React from 'react';
import { Grid, Typography } from '@mui/material';
import { DataEntityClassNameEnum, type DataEntityDetails } from 'generated-sources';
import EntityClassItem from 'components/shared/elements/EntityClassItem/EntityClassItem';
import AppButton from 'components/shared/elements/AppButton/AppButton';
import TriangularUnionIcon from 'components/shared/icons/TriangularUnionIcon';
import EntitiesListModal from 'components/shared/elements/EntitiesListModal/EntitiesListModal';
import { useAppPaths } from 'lib/hooks';
import * as S from './OverviewEntityGroupStatsStyles';

interface OverviewEntityGroupStatsProps {
  dataEntityGroupName: string | undefined;
  entities: DataEntityDetails['entities'];
  entityGroups: DataEntityDetails['dataEntityGroups'];
}

const OverviewEntityGroupStats: React.FC<OverviewEntityGroupStatsProps> = ({
  dataEntityGroupName,
  entities,
  entityGroups,
}) => {
  const { dataEntityOverviewPath } = useAppPaths();

  return (
    <Grid container>
      <Grid item xs={12} sx={{ mb: 1.25 }}>
        <EntityClassItem
          entityClassName={DataEntityClassNameEnum.ENTITY_GROUP}
          fullName
        />
      </Grid>
      <Grid item container xs={6} alignItems='flex-start' alignContent='flex-start'>
        <Grid item container xs={12} alignItems='baseline'>
          <Typography variant='h2' sx={{ mr: 0.5 }}>
            {entities?.length || 0}
          </Typography>
          <Typography variant='body1' color='texts.hint'>
            entities
          </Typography>
        </Grid>
        <Grid
          item
          container
          xs={12}
          direction='column'
          alignItems='flex-start'
          sx={{ mt: 1 }}
        >
          {entities?.slice(0, 5).map(entity => (
            <S.EntityLink key={entity.id} to={dataEntityOverviewPath(entity.id)}>
              <AppButton
                size='medium'
                color='tertiary'
                sx={{
                  my: 0.25,
                  width: 'inherit',
                  justifyContent: 'flex-start',
                }}
              >
                <S.TruncatedText>
                  {entity.internalName || entity.externalName}
                </S.TruncatedText>
              </AppButton>
            </S.EntityLink>
          ))}
          {entities && entities?.length > 5 ? (
            <EntitiesListModal
              entities={entities}
              labelFor='Entities'
              dataEntityName={dataEntityGroupName}
              openBtnEl={
                <AppButton size='medium' color='tertiary' sx={{ my: 0.25 }}>
                  Show All
                </AppButton>
              }
            />
          ) : null}
        </Grid>
      </Grid>
      <Grid item container xs={6} alignItems='flex-start' alignContent='flex-start'>
        <Grid item container xs={12} alignItems='baseline'>
          <S.StatIconContainer sx={{ mr: 1 }}>
            <TriangularUnionIcon />
          </S.StatIconContainer>
          <Typography variant='h2' sx={{ mr: 0.5 }}>
            {entityGroups?.length || 0}
          </Typography>
          <Typography variant='body1' color='texts.hint'>
            upper groups
          </Typography>
        </Grid>
        <Grid
          item
          container
          xs={12}
          direction='column'
          alignItems='flex-start'
          sx={{ mt: 1 }}
        >
          {entityGroups?.slice(0, 5).map(entityGroup => (
            <S.EntityLink
              key={entityGroup.id}
              to={dataEntityOverviewPath(entityGroup.id)}
            >
              <AppButton
                size='medium'
                color='tertiary'
                sx={{
                  my: 0.25,
                  width: 'inherit',
                  justifyContent: 'flex-start',
                }}
              >
                <S.TruncatedText>
                  {entityGroup.internalName || entityGroup.externalName}
                </S.TruncatedText>
              </AppButton>
            </S.EntityLink>
          ))}
          {entityGroups && entityGroups?.length > 5 ? (
            <EntitiesListModal
              entities={entityGroups}
              labelFor='Upper groups'
              dataEntityName={dataEntityGroupName}
              openBtnEl={
                <AppButton size='medium' color='tertiary' sx={{ my: 0.25 }}>
                  Show All
                </AppButton>
              }
            />
          ) : null}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default OverviewEntityGroupStats;
