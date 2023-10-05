import React, { type FC, useEffect, useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import ActivityFieldHeader from 'components/shared/elements/Activity/ActivityFields/ActivityFieldHeader/ActivityFieldHeader';
import ActivityFieldState from 'components/shared/elements/Activity/ActivityFields/ActivityFieldState/ActivityFieldState';
import type { DataEntityStatusActivityState } from 'generated-sources';
import type { SerializeDateToNumber } from 'redux/interfaces';
import { EntityStatus } from 'components/shared/elements/index';
import { useAppDateTime } from 'lib/hooks';

interface EntityStatusActivityFieldProps {
  oldState: SerializeDateToNumber<DataEntityStatusActivityState | undefined>;
  newState: SerializeDateToNumber<DataEntityStatusActivityState | undefined>;
  hideAllDetails: boolean;
}

const EntityStatusActivityField: FC<EntityStatusActivityFieldProps> = ({
  oldState,
  newState,
  hideAllDetails,
}) => {
  const { entityStatusFormattedDateTime } = useAppDateTime();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => setIsDetailsOpen(false), [hideAllDetails]);

  const getSwitchDateText = (statusSwitchTime: number | undefined) =>
    statusSwitchTime
      ? `Status will switch to Deleted at ${entityStatusFormattedDateTime(
          statusSwitchTime
        )}`
      : '';

  return (
    <Grid container flexDirection='column'>
      <ActivityFieldHeader
        startText='Data entity'
        activityName='status'
        eventType='updated'
        showDetailsBtn
        detailsBtnOnClick={() => setIsDetailsOpen(!isDetailsOpen)}
        isDetailsOpen={isDetailsOpen}
      />
      <ActivityFieldState
        isDetailsOpen={isDetailsOpen}
        oldStateChildren={
          oldState !== undefined &&
          oldState.status !== undefined && (
            <Box display='flex' flexDirection='column'>
              <EntityStatus entityStatus={oldState.status} />
              <Typography mt={0.5} variant='subtitle2' whiteSpace='nowrap'>
                {getSwitchDateText(oldState?.status.statusSwitchTime)}
              </Typography>
            </Box>
          )
        }
        newStateChildren={
          newState !== undefined &&
          newState.status !== undefined && (
            <Box display='flex' flexDirection='column'>
              <EntityStatus entityStatus={newState.status} />
              <Typography mt={0.5} variant='subtitle2' whiteSpace='nowrap'>
                {getSwitchDateText(newState?.status.statusSwitchTime)}
              </Typography>
            </Box>
          )
        }
      />
    </Grid>
  );
};

export default EntityStatusActivityField;
