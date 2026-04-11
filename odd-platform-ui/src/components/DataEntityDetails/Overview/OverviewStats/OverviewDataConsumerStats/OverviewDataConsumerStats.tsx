import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DataEntityClassNameEnum, type DataEntityDetails } from 'generated-sources';
import { EntitiesListModal, Button, EntityClassItem } from 'components/shared/elements';
import { dataEntityDetailsPath } from 'routes';

interface OverviewDataConsumerStatsProps {
  inputs: DataEntityDetails['inputList'];
  unknownInputsCount: number;
  dataEntityName: string | undefined;
}

const OverviewDataConsumerStats: React.FC<OverviewDataConsumerStatsProps> = ({
  inputs,
  unknownInputsCount,
  dataEntityName,
}) => {
  const { t } = useTranslation();
  const displayedEntitiesNumber = 10;

  return (
    <Grid container>
      <Grid sx={{ ml: 0, mb: 1.25 }} item xs={12}>
        <EntityClassItem entityClassName={DataEntityClassNameEnum.CONSUMER} fullName />
      </Grid>
      <Grid item container xs={6} alignItems='flex-start' alignContent='flex-start'>
        <Grid item container xs={12} alignItems='baseline'>
          <Typography variant='h2'>
            {(inputs?.length || 0) + (unknownInputsCount || 0)}
          </Typography>
          <Typography sx={{ ml: 0.5 }} variant='h4'>
            {t('inputs')}
          </Typography>
        </Grid>
        <Grid item container xs={12} direction='column' alignItems='flex-start'>
          {inputs?.slice(0, displayedEntitiesNumber).map(input => (
            <Button
              text={input.internalName || input.externalName}
              to={dataEntityDetailsPath(input.id)}
              key={input.id}
              sx={{ my: 0.25 }}
              buttonType='tertiary-m'
              onClick={() => {}}
            />
          ))}
          {unknownInputsCount ? (
            <Typography sx={{ ml: 0.5 }} variant='subtitle1'>
              {unknownInputsCount} {t('more source')}
              {unknownInputsCount === 1 ? '' : 's'} {t('unknown')}
            </Typography>
          ) : null}
          {inputs && inputs?.length > displayedEntitiesNumber ? (
            <EntitiesListModal
              entities={inputs}
              labelFor={t('Inputs')}
              dataEntityName={dataEntityName}
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

export default OverviewDataConsumerStats;
