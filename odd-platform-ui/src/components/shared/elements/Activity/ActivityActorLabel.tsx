import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { UserIcon } from 'components/shared/icons';
import AppTooltip from 'components/shared/elements/AppTooltip/AppTooltip';
import type { Activity } from 'redux/interfaces';
import * as S from './Activity.styles';

interface ActivityActorLabelProps {
  createdBy?: Activity['createdBy'];
}

// Renders an action's actor explicitly: the immutable external **username** of whoever made the change,
// and — labelled "current owner" — that user's owner association **as of now**. The "current" label +
// the tooltip are deliberate: the owner shown is the present association, which may differ from the
// user's owner at the time the change was actually made (ODD does not record the change-time owner).
// Shared by the global + per-entity Activity items (#1657 / CTRIB-010).
const ActivityActorLabel: React.FC<ActivityActorLabelProps> = ({ createdBy }) => {
  const { t } = useTranslation();
  const username = createdBy?.identity?.username;
  const ownerName = createdBy?.owner?.name;
  const showOwner = !!username && !!ownerName && ownerName !== username;

  return (
    <Grid display='flex' flexWrap='nowrap' alignItems='center'>
      <UserIcon stroke='black' />
      <Typography variant='body1' sx={{ ml: 0.5 }}>
        {username || ownerName}
      </Typography>
      {showOwner && (
        <AppTooltip
          checkForOverflow={false}
          title={
            <S.TooltipBody>
              {t(
                "The owner shown is the user's current association (as of now) - it may differ from the user's owner at the time the change was made."
              )}
            </S.TooltipBody>
          }
        >
          <Typography
            component='span'
            variant='subtitle1'
            sx={{ ml: 0.5, color: 'text.secondary', cursor: 'help' }}
          >
            {t('current owner')}: {ownerName}
          </Typography>
        </AppTooltip>
      )}
    </Grid>
  );
};

export default ActivityActorLabel;
