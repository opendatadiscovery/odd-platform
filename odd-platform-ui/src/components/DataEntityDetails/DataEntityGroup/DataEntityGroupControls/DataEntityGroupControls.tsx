import { Grid } from '@mui/material';
import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  AppIconButton,
  AppMenuItem,
  AppPopover,
  ConfirmationDialog,
} from 'components/shared';
import { KebabIcon } from 'components/shared/Icons';
import { useAppParams, useAppPaths } from 'lib/hooks';
import { deleteDataEntityGroup } from 'redux/thunks';
import { getSearchId } from 'redux/selectors';
import { Permission, PermissionResourceType } from 'generated-sources';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { PermissionProvider, WithPermissions } from 'components/shared/contexts';
import DataEntityGroupForm from '../DataEntityGroupForm/DataEntityGroupForm';

interface DataEntityGroupControlsProps {
  internalName: string | undefined;
  externalName: string | undefined;
}

const DataEntityGroupControls: React.FC<DataEntityGroupControlsProps> = ({
  internalName,
  externalName,
}) => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { dataEntityId } = useAppParams();
  const { searchPath } = useAppPaths();

  const searchId = useAppSelector(getSearchId);

  const handleEntityGroupDelete = React.useCallback(
    () =>
      dispatch(deleteDataEntityGroup({ dataEntityGroupId: dataEntityId })).then(() =>
        history.push(searchPath(searchId))
      ),
    [deleteDataEntityGroup, dataEntityId]
  );

  return (
    <Grid>
      <AppPopover
        childrenSx={{
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
        renderOpenBtn={({ onClick, ariaDescribedBy }) => (
          <AppIconButton
            sx={{ ml: 2 }}
            ariaDescribedBy={ariaDescribedBy}
            size='medium'
            color='primaryLight'
            icon={<KebabIcon />}
            onClick={onClick}
          />
        )}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 65,
        }}
      >
        <PermissionProvider permissions={[Permission.DATA_ENTITY_GROUP_UPDATE]}>
          <WithPermissions
            resourceId={dataEntityId}
            resourceType={PermissionResourceType.DATA_ENTITY}
            renderContent={({ isAllowedTo: editGroup }) => (
              <DataEntityGroupForm
                btnCreateEl={<AppMenuItem disabled={!editGroup}>Edit</AppMenuItem>}
              />
            )}
          />
        </PermissionProvider>

        <PermissionProvider permissions={[Permission.DATA_ENTITY_GROUP_DELETE]}>
          <WithPermissions
            resourceId={dataEntityId}
            resourceType={PermissionResourceType.DATA_ENTITY}
            renderContent={({ isAllowedTo: deleteGroup }) => (
              <ConfirmationDialog
                actionTitle='Are you sure you want to delete this data entity group?'
                actionName='Delete Data Entity Group'
                actionText={
                  <>
                    &quot;
                    {internalName || externalName}
                    &quot; will be deleted permanently.
                  </>
                }
                onConfirm={handleEntityGroupDelete}
                actionBtn={<AppMenuItem disabled={!deleteGroup}>Delete</AppMenuItem>}
              />
            )}
          />
        </PermissionProvider>
      </AppPopover>
    </Grid>
  );
};

export default DataEntityGroupControls;
