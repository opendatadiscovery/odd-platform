import React from 'react';
import { Collapse, Grid, Typography } from '@mui/material';
import { AddIcon } from 'components/shared/icons';
import { Button } from 'components/shared/elements';
import {
  getDataEntityCustomMetadataList,
  getDataEntityPredefinedMetadataList,
} from 'redux/selectors';
import { useAppParams } from 'lib/hooks';
import { useAppSelector } from 'redux/lib/hooks';
import { WithPermissions } from 'components/shared/contexts';
import { Permission } from 'generated-sources';
import MetadataCreateForm from '../../Metadata/MetadataCreateForm/MetadataCreateForm';
import MetadataItem from './MetadataItem/MetadataItem';
import { SubtitleContainer } from './OverviewMetadataStyles';

const OverviewMetadata: React.FC = () => {
  const { dataEntityId } = useAppParams();

  const predefinedMetadata = useAppSelector(
    getDataEntityPredefinedMetadataList(dataEntityId)
  );
  const customMetadata = useAppSelector(getDataEntityCustomMetadataList(dataEntityId));

  const visibleLimit = 10;

  const [predefOpen, setPredefOpen] = React.useState(false);
  const [customOpen, setCustomOpen] = React.useState(false);

  let collapsedPredefined;
  if (predefinedMetadata?.length > visibleLimit) {
    collapsedPredefined = (
      <Grid container flexDirection='column'>
        <Collapse in={predefOpen} timeout='auto' unmountOnExit sx={{ mt: 0.5 }}>
          {predefOpen ? (
            <Grid container>
              {predefinedMetadata?.slice(visibleLimit).map(item => (
                <MetadataItem
                  dataEntityId={dataEntityId}
                  metadataItem={item}
                  key={item.field.id}
                />
              ))}
            </Grid>
          ) : null}
        </Collapse>
        <Button
          text={
            predefOpen ? 'Hide' : `View All (${predefinedMetadata.length - visibleLimit})`
          }
          buttonType='tertiary-m'
          onClick={() => setPredefOpen(!predefOpen)}
          sx={{ mt: 0.75, width: 'fit-content' }}
        />
      </Grid>
    );
  }

  let collapsedCustom;
  if (customMetadata?.length > visibleLimit) {
    collapsedCustom = (
      <Grid container flexDirection='column'>
        <Collapse in={customOpen} timeout='auto' unmountOnExit sx={{ mt: 0.5 }}>
          {customOpen ? (
            <Grid container>
              {customMetadata?.slice(visibleLimit + 1).map(item => (
                <MetadataItem
                  dataEntityId={dataEntityId}
                  metadataItem={item}
                  key={item.field.id}
                />
              ))}
            </Grid>
          ) : null}
        </Collapse>
        <Button
          text={
            customOpen ? 'Hide' : `View All (${customMetadata.length - visibleLimit})`
          }
          sx={{ mt: 0.75, width: 'fit-content' }}
          buttonType='tertiary-m'
          onClick={() => setCustomOpen(!customOpen)}
        />
      </Grid>
    );
  }
  return (
    <>
      <Grid item container>
        <Grid container>
          <Grid item xs={12}>
            <SubtitleContainer>
              <Typography variant='h4'>Custom</Typography>
              <WithPermissions
                permissionTo={Permission.DATA_ENTITY_CUSTOM_METADATA_CREATE}
              >
                <MetadataCreateForm
                  dataEntityId={dataEntityId}
                  btnCreateEl={
                    <Button
                      text='Add metadata'
                      data-qa='add_metadata'
                      buttonType='secondary-m'
                      startIcon={<AddIcon />}
                    />
                  }
                />
              </WithPermissions>
            </SubtitleContainer>
          </Grid>
          {customMetadata.length ? (
            customMetadata
              ?.slice(0, visibleLimit)
              .map(item => (
                <MetadataItem
                  dataEntityId={dataEntityId}
                  metadataItem={item}
                  key={item.field.id}
                />
              ))
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
                permissionTo={Permission.DATA_ENTITY_CUSTOM_METADATA_CREATE}
              >
                <MetadataCreateForm
                  dataEntityId={dataEntityId}
                  btnCreateEl={
                    <MetadataCreateForm
                      dataEntityId={dataEntityId}
                      btnCreateEl={
                        <Button
                          text='Add Metadata'
                          sx={{ ml: 0.5 }}
                          buttonType='tertiary-m'
                        />
                      }
                    />
                  }
                />
              </WithPermissions>
            </Grid>
          )}
        </Grid>
        {collapsedCustom}
      </Grid>
      {predefinedMetadata.length > 0 && (
        <Grid item container>
          <Grid container>
            <Grid item xs={12}>
              <SubtitleContainer>
                <Typography variant='h4'>Pre-defined</Typography>
              </SubtitleContainer>
            </Grid>
            {predefinedMetadata?.slice(0, visibleLimit).map(item => (
              <MetadataItem
                dataEntityId={dataEntityId}
                metadataItem={item}
                key={item.field.id}
              />
            ))}
          </Grid>
          {collapsedPredefined}
        </Grid>
      )}
    </>
  );
};

export default OverviewMetadata;
