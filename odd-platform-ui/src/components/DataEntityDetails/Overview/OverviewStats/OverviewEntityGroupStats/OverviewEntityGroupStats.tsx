import React from 'react';
import { Grid, Typography } from '@mui/material';
import { DataEntityClassNameEnum, type DataEntityDetails } from 'generated-sources';
import { Button, EntitiesListModal, EntityClassItem } from 'components/shared/elements';
import { TriangularUnionIcon } from 'components/shared/icons';
import { useAppPaths } from 'lib/hooks';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
          <Typography variant='h4'>{t('entities')}</Typography>
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
            <Button
              text={entity.internalName || entity.externalName}
              key={entity.id}
              to={dataEntityOverviewPath(entity.id)}
              buttonType='link-m'
              sx={{ my: 0.25 }}
            />
          ))}
          {entities && entities?.length > 5 ? (
            <EntitiesListModal
              entities={entities}
              labelFor={t('Entities')}
              dataEntityName={dataEntityGroupName}
              openBtnEl={
                <Button text={t('Show All')} buttonType='tertiary-m' sx={{ my: 0.25 }} />
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
          <Typography variant='h4'>{t('upper groups')}</Typography>
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
            <Button
              text={entityGroup.internalName || entityGroup.externalName}
              key={entityGroup.id}
              to={dataEntityOverviewPath(entityGroup.id)}
              buttonType='link-m'
              sx={{ my: 0.25 }}
            />
          ))}
          {entityGroups && entityGroups?.length > 5 ? (
            <EntitiesListModal
              entities={entityGroups}
              labelFor={t('Upper groups')}
              dataEntityName={dataEntityGroupName}
              openBtnEl={
                <Button text={t('Show All')} buttonType='tertiary-m' sx={{ my: 0.25 }} />
              }
            />
          ) : null}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default OverviewEntityGroupStats;
