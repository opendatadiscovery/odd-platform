import { Grid } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppMenuItem,
  AppPopover,
  Button,
  ConfirmationDialog,
} from 'components/shared/elements';
import { KebabIcon } from 'components/shared/icons';
import { useAppParams, useAppPaths } from 'lib/hooks';
import { deleteDataEntityGroup } from 'redux/thunks';
import { getSearchId } from 'redux/selectors';
import { Permission } from 'generated-sources';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { WithPermissions } from 'components/shared/contexts';
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
  const navigate = useNavigate();
  const { dataEntityId } = useAppParams();
  const { searchPath } = useAppPaths();

  const searchId = useAppSelector(getSearchId);

  const handleEntityGroupDelete = React.useCallback(
    () =>
      dispatch(deleteDataEntityGroup({ dataEntityGroupId: dataEntityId })).then(() => {
        navigate(searchPath(searchId));
      }),
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
          <Button
            aria-describedby={ariaDescribedBy}
            buttonType='secondary-m'
            icon={<KebabIcon />}
            sx={{ ml: 2 }}
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
        <WithPermissions permissionTo={Permission.DATA_ENTITY_GROUP_UPDATE}>
          <DataEntityGroupForm btnCreateEl={<AppMenuItem>Edit</AppMenuItem>} />
        </WithPermissions>
        <WithPermissions permissionTo={Permission.DATA_ENTITY_GROUP_DELETE}>
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
            actionBtn={<AppMenuItem>Delete</AppMenuItem>}
          />
        </WithPermissions>
      </AppPopover>
    </Grid>
  );
};

export default DataEntityGroupControls;
