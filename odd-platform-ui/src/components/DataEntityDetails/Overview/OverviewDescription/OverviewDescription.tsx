import React, { useCallback, useEffect, useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { AddIcon, ChevronIcon, EditIcon } from 'components/shared/icons';
import { Button } from 'components/shared/elements';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { updateDataEntityInternalDescription } from 'redux/thunks';
import { useAppParams, useCollapse } from 'lib/hooks';
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

  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const [internalDescription, setInternalDescription] = useState<string | undefined>(
    DEInternalDescription || ''
  );

  const { contentRef, containerStyle, controlsStyle, toggleCollapse, isCollapsed } =
    useCollapse({ initialMaxHeight: 304 });

  const onEditClick = useCallback(() => {
    setEditMode(true);
  }, []);

  const handleDescriptionUpdate = useCallback(() => {
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

  useEffect(
    () => setInternalDescription(DEInternalDescription),
    [DEInternalDescription, editMode]
  );

  return (
    <>
      <div ref={contentRef} style={containerStyle}>
        <S.CaptionContainer>
          <Typography variant='h2'>About</Typography>
          <WithPermissions permissionTo={Permission.DATA_ENTITY_DESCRIPTION_UPDATE}>
            <Button
              text={`${DEInternalDescription ? 'Edit' : 'Add'} info`}
              data-qa='add_description'
              onClick={onEditClick}
              buttonType='secondary-lg'
              startIcon={DEInternalDescription ? <EditIcon /> : <AddIcon />}
            />
          </WithPermissions>
        </S.CaptionContainer>
        <div data-color-mode='light'>
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
                  <WithPermissions
                    permissionTo={Permission.DATA_ENTITY_DESCRIPTION_UPDATE}
                  >
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
          <S.ExternalContainer data-color-mode='light'>
            <MDEditor.Markdown source={DEExternalDescription} />
          </S.ExternalContainer>
        ) : null}
      </div>
      <S.CollapseContainer container style={controlsStyle}>
        <Button
          text={isCollapsed ? 'Show hidden' : `Hide`}
          endIcon={
            <ChevronIcon
              width={10}
              height={5}
              transform={isCollapsed ? 'rotate(0)' : 'rotate(180)'}
            />
          }
          buttonType='service-m'
          onClick={toggleCollapse}
        />
      </S.CollapseContainer>
    </>
  );
};

export default OverviewDescription;
