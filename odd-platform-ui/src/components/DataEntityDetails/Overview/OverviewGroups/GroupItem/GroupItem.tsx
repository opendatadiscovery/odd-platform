import React from 'react';
import { Grid, Typography } from '@mui/material';
import CloseIcon from 'components/shared/Icons/CloseIcon';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import { DataEntityRef } from 'generated-sources';
import { useAppDispatch } from 'redux/lib/hooks';
import { deleteDataEntityFromGroup } from 'redux/thunks';
import { useAppPaths } from 'lib/hooks';
import * as S from './GroupItemStyles';

interface GroupItemProps {
  dataEntityId: number;
  group: DataEntityRef;
}

const GroupItem: React.FC<GroupItemProps> = ({ dataEntityId, group }) => {
  const dispatch = useAppDispatch();
  const { dataEntityDetailsPath } = useAppPaths();
  const groupDetailsLink = dataEntityDetailsPath(group.id);

  return (
    <S.GroupItemContainer to={groupDetailsLink}>
      <Grid
        sx={{ my: 0.5 }}
        container
        flexWrap="nowrap"
        justifyContent="space-between"
      >
        <Grid container flexDirection="column">
          <Typography variant="body1" color="texts.action">
            {group.internalName || group.externalName}
          </Typography>
        </Grid>
        <S.ActionsContainer>
          {group.manuallyCreated && (
            <AppIconButton
              size="small"
              color="unfilled"
              icon={<CloseIcon />}
              onClick={e => {
                e.preventDefault();
                return dispatch(
                  deleteDataEntityFromGroup({
                    dataEntityId,
                    dataEntityGroupId: group.id,
                  })
                );
              }}
              sx={{ ml: 0.25 }}
            />
          )}
        </S.ActionsContainer>
      </Grid>
    </S.GroupItemContainer>
  );
};

export default GroupItem;
