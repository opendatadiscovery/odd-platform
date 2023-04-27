import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { AddIcon, EditIcon } from 'components/shared/icons';
import { Button } from 'components/shared/elements';
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
            <WithPermissions permissionTo={Permission.DATA_ENTITY_DESCRIPTION_UPDATE}>
              <Button
                text={`${DEInternalDescription ? 'Edit' : 'Add'} description`}
                data-qa='add_description'
                onClick={onEditClick}
                buttonType='secondary-m'
                startIcon={DEInternalDescription ? <EditIcon /> : <AddIcon />}
              />
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
              <Button
                text='Save'
                onClick={handleDescriptionUpdate}
                buttonType='main-m'
                sx={{ mr: 1 }}
              />
              <Button
                text='Cancel'
                onClick={() => setEditMode(false)}
                buttonType='secondary-m'
              />
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
                <WithPermissions permissionTo={Permission.DATA_ENTITY_DESCRIPTION_UPDATE}>
                  <Button
                    text='Add Description'
                    onClick={onEditClick}
                    buttonType='tertiary-sm'
                  />
                </WithPermissions>
              </Grid>
            )}
          </div>
        )}
      </div>
      {DEExternalDescription ? (
        <div data-color-mode='light'>
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
