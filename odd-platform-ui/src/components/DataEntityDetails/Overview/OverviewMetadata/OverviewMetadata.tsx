import React from 'react';
import { Collapse, Grid, Typography } from '@mui/material';
import { AddIcon } from 'components/shared/Icons';
import { AppButton } from 'components/shared';
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
        <AppButton
          size='small'
          color='tertiary'
          onClick={() => setPredefOpen(!predefOpen)}
          sx={{ mt: 0.75, width: 'fit-content' }}
        >
          {predefOpen ? 'Hide' : `View All (${predefinedMetadata.length - visibleLimit})`}
        </AppButton>
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
        <AppButton
          sx={{ mt: 0.75, width: 'fit-content' }}
          size='small'
          color='tertiary'
          onClick={() => setCustomOpen(!customOpen)}
        >
          {customOpen ? 'Hide' : `View All (${customMetadata.length - visibleLimit})`}
        </AppButton>
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
                    <AppButton
                      data-qa='add_metadata'
                      size='medium'
                      color='primaryLight'
                      startIcon={<AddIcon />}
                    >
                      Add metadata
                    </AppButton>
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
                        <AppButton sx={{ ml: 0.5 }} size='small' color='tertiary'>
                          Add Metadata
                        </AppButton>
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
