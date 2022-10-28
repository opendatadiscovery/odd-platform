import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { AddIcon, EditIcon } from 'components/shared/Icons';
import { AppButton } from 'components/shared';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { updateDataEntityInternalDescription } from 'redux/thunks';
import { useAppParams } from 'lib/hooks';
import {
  getDataEntityExternalDescription,
  getDataEntityInternalDescription,
} from 'redux/selectors';
import MDEditor from '@uiw/react-md-editor';
import { WithPermissions } from 'components/shared/contexts';
import { Permission } from 'generated-sources';
import * as S from './OverviewDescriptionStyles';

const OverviewDescription: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dataEntityId } = useAppParams();

  const DEInternalDescription = useAppSelector(
    getDataEntityInternalDescription(dataEntityId)
  );
  const DEExternalDescription = useAppSelector(
    getDataEntityExternalDescription(dataEntityId)
  );

  const [editMode, setEditMode] = React.useState(false);
  const [error, setError] = React.useState('');
  const [internalDescription, setInternalDescription] = React.useState<
    string | undefined
  >(DEInternalDescription || '');

  const onEditClick = React.useCallback(() => setEditMode(true), [setEditMode]);

  const handleDescriptionUpdate = React.useCallback(() => {
    dispatch(
      updateDataEntityInternalDescription({
        dataEntityId,
        internalDescriptionFormData: { internalDescription: internalDescription || '' },
      })
    ).then(
      () => {
        setError('');
        setEditMode(false);
      },
      (response: Response) => {
        setError(response.statusText || 'Unable to update description');
      }
    );
  }, [internalDescription]);

  const saveMarkDownOnEnter = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && e.shiftKey) {
      handleDescriptionUpdate();
    }
  };

  React.useEffect(
    () => setInternalDescription(DEInternalDescription),
    [DEInternalDescription, editMode]
  );

  return (
    <>
      <div data-color-mode='light'>
        <S.CaptionContainer>
          <Typography variant='h4'>Custom</Typography>
          {editMode ? null : (
            <WithPermissions
              resourceId={dataEntityId}
              permissionTo={Permission.DATA_ENTITY_DESCRIPTION_UPDATE}
            >
              <AppButton
                onClick={onEditClick}
                size='medium'
                color='primaryLight'
                startIcon={DEInternalDescription ? <EditIcon /> : <AddIcon />}
              >
                {DEInternalDescription ? 'Edit' : 'Add'} description
              </AppButton>
            </WithPermissions>
          )}
        </S.CaptionContainer>
        {editMode ? (
          <Box onKeyDown={saveMarkDownOnEnter}>
            <MDEditor
              height={200}
              value={internalDescription}
              onChange={setInternalDescription}
              preview='edit'
            />
            <S.FormActions>
              <AppButton
                onClick={handleDescriptionUpdate}
                size='small'
                color='primary'
                sx={{ mr: 1 }}
              >
                Save
              </AppButton>
              <AppButton
                onClick={() => setEditMode(false)}
                size='small'
                color='primaryLight'
              >
                Cancel
              </AppButton>
              <Typography variant='subtitle2' color='error'>
                {error}
              </Typography>
            </S.FormActions>
          </Box>
        ) : (
          <div>
            {DEInternalDescription ? (
              <MDEditor.Markdown source={internalDescription} />
            ) : (
              <Grid
                item
                xs={12}
                container
                alignItems='center'
                justifyContent='flex-start'
                wrap='nowrap'
              >
                <Typography variant='subtitle2'>Not created.</Typography>
                <WithPermissions
                  resourceId={dataEntityId}
                  permissionTo={Permission.DATA_ENTITY_DESCRIPTION_UPDATE}
                >
                  <AppButton onClick={onEditClick} size='small' color='tertiary'>
                    Add Description
                  </AppButton>
                </WithPermissions>
              </Grid>
            )}
          </div>
        )}
      </div>
      {DEExternalDescription ? (
        <div>
          <Typography variant='h4'>Pre-defined</Typography>
          <Typography variant='subtitle1'>
            <MDEditor.Markdown source={DEExternalDescription} />
          </Typography>
        </div>
      ) : null}
    </>
  );
};

export default OverviewDescription;
