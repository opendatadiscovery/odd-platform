import React from 'react';
import ReactMarkdown from 'react-markdown';
import ReactMde from 'react-mde';
import gfm from 'remark-gfm';
import cx from 'classnames';
import { Typography, Grid } from '@mui/material';
import {
  InternalDescription,
  DataEntityDetailsBaseObject,
  DataEntityApiUpsertDataEntityInternalDescriptionRequest,
} from 'generated-sources';
import AppButton from 'components/shared/AppButton/AppButton';
import EditIcon from 'components/shared/Icons/EditIcon';
import AddIcon from 'components/shared/Icons/AddIcon';
import 'react-mde/lib/styles/css/react-mde-all.css';
import 'github-markdown-css';
import { StylesType } from './OverviewDescriptionStyles';

interface OverviewDescriptionProps extends StylesType {
  dataEntityId: number;
  dataEntityInternalDescription: DataEntityDetailsBaseObject['internalDescription'];
  dataEntityExternalDescription: DataEntityDetailsBaseObject['externalDescription'];
  updateDataEntityInternalDescription: (
    params: DataEntityApiUpsertDataEntityInternalDescriptionRequest
  ) => Promise<InternalDescription>;
}

const OverviewDescription: React.FC<OverviewDescriptionProps> = ({
  classes,
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
      <ReactMarkdown
        className={cx('markdown-body', classes.preview)}
        plugins={[gfm]}
        source={
          editMode ? internalDescription : dataEntityInternalDescription
        }
      />
    ),
    [dataEntityInternalDescription, internalDescription, editMode]
  );

  return (
    <>
      <div className={classes.container}>
        <div className={classes.captionContainer}>
          <Typography variant="h4" className={classes.caption}>
            Custom
          </Typography>
          {editMode ? null : (
            <AppButton
              onClick={onEditClick}
              size="medium"
              color="primaryLight"
              icon={
                dataEntityInternalDescription ? <EditIcon /> : <AddIcon />
              }
            >
              {dataEntityInternalDescription ? 'Edit' : 'Add'} description
            </AppButton>
          )}
        </div>
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
            <div className={classes.formActions}>
              <AppButton
                onClick={handleDescriptionUpdate}
                size="medium"
                color="primaryLight"
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
            </div>
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
            <ReactMarkdown
              className={cx('markdown-body', classes.preview)}
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
