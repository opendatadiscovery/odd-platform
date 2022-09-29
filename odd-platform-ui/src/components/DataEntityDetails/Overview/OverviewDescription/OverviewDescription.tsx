import React from 'react';
import ReactMde from 'react-mde';
import { Grid, Typography } from '@mui/material';
import { AddIcon, EditIcon } from 'components/shared/Icons';
import 'react-mde/lib/styles/css/react-mde-all.css';
import 'github-markdown-css';
import { AppButton } from 'components/shared';
import remarkGfm from 'remark-gfm';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { updateDataEntityInternalDescription } from 'redux/thunks';
import { useAppParams, usePermissions } from 'lib/hooks';
import {
  getDataEntityExternalDescription,
  getDataEntityInternalDescription,
} from 'redux/selectors';
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
  const [selectedTab, setSelectedTab] = React.useState<
    'write' | 'preview'
  >('write');
  const [internalDescription, setInternalDescription] =
    React.useState<string>(DEInternalDescription || '');

  const onEditClick = React.useCallback(
    () => setEditMode(true),
    [setEditMode]
  );

  const handleDescriptionUpdate = React.useCallback(() => {
    dispatch(
      updateDataEntityInternalDescription({
        dataEntityId,
        internalDescriptionFormData: {
          internalDescription,
        },
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

  const getPreview = React.useCallback(
    () => (
      <S.Preview remarkPlugins={[remarkGfm]} className="markdown-body">
        {editMode ? internalDescription : DEInternalDescription}
      </S.Preview>
    ),
    [DEInternalDescription, internalDescription, editMode]
  );

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
          <Typography variant="h4">Custom</Typography>
          {editMode ? null : (
            <AppButton
              onClick={onEditClick}
              size="medium"
              color="primaryLight"
              disabled={!editDataEntity}
              startIcon={
                DEInternalDescription ? <EditIcon /> : <AddIcon />
              }
            >
              {DEInternalDescription ? 'Edit' : 'Add'} description
            </AppButton>
          )}
        </S.CaptionContainer>
        {editMode ? (
          // eslint-disable-next-line jsx-a11y/no-static-element-interactions
          <div onKeyDown={saveMarkDownOnEnter}>
            <ReactMde
              minEditorHeight={120}
              value={internalDescription}
              onChange={setInternalDescription}
              selectedTab={selectedTab}
              onTabChange={setSelectedTab}
              generateMarkdownPreview={() => Promise.resolve(getPreview())}
              childProps={{
                writeButton: {
                  tabIndex: -1,
                },
              }}
            />
            <S.FormActions>
              <AppButton
                onClick={handleDescriptionUpdate}
                size="small"
                color="primary"
                sx={{ mr: 1 }}
              >
                Save
              </AppButton>
              <AppButton
                onClick={() => setEditMode(false)}
                size="small"
                color="primaryLight"
              >
                Cancel
              </AppButton>
              <Typography variant="subtitle2" color="error">
                {error}
              </Typography>
            </S.FormActions>
          </div>
        ) : (
          <div>
            {DEInternalDescription ? (
              getPreview()
            ) : (
              <Grid
                item
                xs={12}
                container
                alignItems="center"
                justifyContent="flex-start"
                wrap="nowrap"
              >
                <Typography variant="subtitle2">Not created.</Typography>
                <AppButton
                  onClick={onEditClick}
                  size="small"
                  color="tertiary"
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
          <Typography variant="h4">Pre-defined</Typography>
          <Typography variant="subtitle1">
            <S.Preview
              className="markdown-body"
              remarkPlugins={[remarkGfm]}
            >
              {DEExternalDescription}
            </S.Preview>
          </Typography>
        </div>
      ) : null}
    </>
  );
};

export default OverviewDescription;
