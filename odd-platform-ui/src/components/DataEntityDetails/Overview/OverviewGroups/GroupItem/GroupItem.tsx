import React from 'react';
import { Grid, Typography } from '@mui/material';
import { type DataEntityRef, Permission } from 'generated-sources';
import { useAppDispatch } from 'redux/lib/hooks';
import { deleteDataEntityFromGroup } from 'redux/thunks';
import { useAppPaths } from 'lib/hooks';
import { WithPermissions } from 'components/shared/contexts';
import { Button } from 'components/shared/elements';
import { CloseIcon } from 'components/shared/icons';
import * as S from './GroupItemStyles';

interface GroupItemProps {
  dataEntityId: number;
  group: DataEntityRef;
}

const GroupItem: React.FC<GroupItemProps> = ({ dataEntityId, group }) => {
  const dispatch = useAppDispatch();
  const { dataEntityOverviewPath } = useAppPaths();
  const groupDetailsLink = dataEntityOverviewPath(group.id);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    return dispatch(
      deleteDataEntityFromGroup({ dataEntityId, dataEntityGroupId: group.id })
    );
  };

  return (
    <S.GroupItemContainer to={groupDetailsLink}>
      <Grid sx={{ my: 0.5 }} container flexWrap='nowrap' justifyContent='space-between'>
        <Grid container flexDirection='column'>
          <Typography variant='body1' color='texts.action'>
            {group.internalName || group.externalName}
          </Typography>
        </Grid>
        <S.ActionsContainer>
          <WithPermissions permissionTo={Permission.DATA_ENTITY_DELETE_FROM_GROUP}>
            {group.manuallyCreated && (
              <Button
                buttonType='linkGray-m'
                icon={<CloseIcon />}
                onClick={handleDelete}
                sx={{ ml: 0.25 }}
              />
            )}
          </WithPermissions>
        </S.ActionsContainer>
      </Grid>
    </S.GroupItemContainer>
  );
};

export default GroupItem;
