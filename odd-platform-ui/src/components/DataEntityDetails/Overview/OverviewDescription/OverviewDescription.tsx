import React from 'react';
import ReactMde from 'react-mde';
import gfm from 'remark-gfm';
import { Grid, Typography } from '@mui/material';
import {
  DataEntityApiUpsertDataEntityInternalDescriptionRequest,
  DataEntityDetailsBaseObject,
  InternalDescription,
} from 'generated-sources';
import EditIcon from 'components/shared/Icons/EditIcon';
import AddIcon from 'components/shared/Icons/AddIcon';
import 'react-mde/lib/styles/css/react-mde-all.css';
import 'github-markdown-css';
import AppButton from 'components/shared/AppButton/AppButton';
import {
  CaptionContainer,
  FormActions,
  Preview,
} from './OverviewDescriptionStyles';

interface OverviewDescriptionProps {
  dataEntityId: number;
  dataEntityInternalDescription: DataEntityDetailsBaseObject['internalDescription'];
  dataEntityExternalDescription: DataEntityDetailsBaseObject['externalDescription'];
  updateDataEntityInternalDescription: (
    params: DataEntityApiUpsertDataEntityInternalDescriptionRequest
  ) => Promise<InternalDescription>;
}

const OverviewDescription: React.FC<OverviewDescriptionProps> = ({
  dataEntityId,
  dataEntityInternalDescription,
  dataEntityExternalDescription,
  updateDataEntityInternalDescription,
}) => {
  const [editMode, setEditMode] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const [selectedTab, setSelectedTab] = React.useState<
    'write' | 'preview'
  >('write');
  const [
    internalDescription,
    setInternalDescription,
  ] = React.useState<string>(dataEntityInternalDescription || '');
  const onEditClick = React.useCallback(() => setEditMode(true), [
    setEditMode,
  ]);
  const handleDescriptionUpdate = React.useCallback(() => {
    updateDataEntityInternalDescription({
      dataEntityId,
      internalDescriptionFormData: {
        internalDescription,
      },
    }).then(
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
      <Preview
        plugins={[gfm]}
        className="markdown-body"
        source={
          editMode ? internalDescription : dataEntityInternalDescription
        }
      />
    ),
    [dataEntityInternalDescription, internalDescription, editMode]
  );

  return (
    <>
      <div>
        <CaptionContainer>
          <Typography variant="h4">Custom</Typography>
          {editMode ? null : (
            <AppButton
              onClick={onEditClick}
              size="medium"
              color="primaryLight"
              startIcon={
                dataEntityInternalDescription ? <EditIcon /> : <AddIcon />
              }
            >
              {dataEntityInternalDescription ? 'Edit' : 'Add'} description
            </AppButton>
          )}
        </CaptionContainer>
        {editMode ? (
          <div>
            <ReactMde
              minEditorHeight={300}
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
            <FormActions>
              <AppButton
                onClick={handleDescriptionUpdate}
                size="medium"
                color="primaryLight"
                sx={{ mr: 0.5 }}
              >
                Save
              </AppButton>
              <AppButton
                onClick={() => setEditMode(false)}
                size="medium"
                color="tertiary"
              >
                Cancel
              </AppButton>
              <Typography variant="subtitle2" color="error">
                {error}
              </Typography>
            </FormActions>
          </div>
        ) : (
          <div>
            {dataEntityInternalDescription ? (
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
                >
                  Add Description
                </AppButton>
              </Grid>
            )}
          </div>
        )}
      </div>
      {dataEntityExternalDescription ? (
        <div>
          <Typography variant="h4">Pre-defined</Typography>
          <Typography variant="subtitle1">
            <Preview
              className="markdown-body"
              plugins={[gfm]}
              source={dataEntityExternalDescription}
            />
          </Typography>
        </div>
      ) : null}
    </>
  );
};

export default OverviewDescription;
