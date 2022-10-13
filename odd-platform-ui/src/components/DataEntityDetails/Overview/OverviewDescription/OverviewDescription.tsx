import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { AddIcon, EditIcon } from 'components/shared/Icons';
import { AppButton } from 'components/shared';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { updateDataEntityInternalDescription } from 'redux/thunks';
import { useAppParams, usePermissions } from 'lib/hooks';
import {
  getDataEntityExternalDescription,
  getDataEntityInternalDescription,
} from 'redux/selectors';
import MDEditor from '@uiw/react-md-editor';
import * as S from './OverviewDescriptionStyles';

const OverviewDescription: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dataEntityId } = useAppParams();
  const { isAllowedTo: editDataEntity } = usePermissions({ dataEntityId });

  const DEInternalDescription = useAppSelector(
    getDataEntityInternalDescription(dataEntityId)
  );
  const DEExternalDescription = useAppSelector(
    getDataEntityExternalDescription(dataEntityId)
  );

  const [editMode, setEditMode] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
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
      <div>
        <S.CaptionContainer>
          <Typography variant='h4'>Custom</Typography>
          {editMode ? null : (
            <AppButton
              onClick={onEditClick}
              size='medium'
              color='primaryLight'
              disabled={!editDataEntity}
              startIcon={DEInternalDescription ? <EditIcon /> : <AddIcon />}
            >
              {DEInternalDescription ? 'Edit' : 'Add'} description
            </AppButton>
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
                <AppButton
                  onClick={onEditClick}
                  size='small'
                  color='tertiary'
                  disabled={!editDataEntity}
                >
                  Add Description
                </AppButton>
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
