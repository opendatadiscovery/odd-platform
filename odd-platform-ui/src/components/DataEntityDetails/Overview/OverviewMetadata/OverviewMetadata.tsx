import React from 'react';
import { Collapse, Grid, Typography } from '@mui/material';
import { MetadataFieldValue } from 'generated-sources';
import AddIcon from 'components/shared/Icons/AddIcon';
import MetadataCreateFormContainer from 'components/DataEntityDetails/Metadata/MetadataCreateForm/MetadataCreateFormContainer';
import AppButton from 'components/shared/AppButton/AppButton';
import MetadataItemContainer from './MetadataItem/MetadataItemContainer';
import { SubtitleContainer } from './OverviewMetadataStyles';

interface OverviewMetadataProps {
  dataEntityId: number;
  predefinedMetadata: MetadataFieldValue[];
  customMetadata: MetadataFieldValue[];
}

const OverviewMetadata: React.FC<OverviewMetadataProps> = ({
  dataEntityId,
  predefinedMetadata = [],
  customMetadata = [],
}) => {
  const visibleLimit = 10;

  const [predefOpen, setPredefOpen] = React.useState<boolean>(false);
  const [customOpen, setCustomOpen] = React.useState<boolean>(false);

  let collapsedPredefined;
  if (predefinedMetadata?.length > visibleLimit) {
    collapsedPredefined = (
      <Grid container flexDirection="column">
        <Collapse
          in={predefOpen}
          timeout="auto"
          unmountOnExit
          sx={{ mt: 0.5 }}
        >
          {predefOpen ? (
            <Grid container>
              {predefinedMetadata?.slice(visibleLimit).map(item => (
                <MetadataItemContainer
                  dataEntityId={dataEntityId}
                  metadataItem={item}
                  key={item.field.id}
                />
              ))}
            </Grid>
          ) : null}
        </Collapse>
        <AppButton
          size="small"
          color="tertiary"
          onClick={() => setPredefOpen(!predefOpen)}
          sx={{ mt: 0.75, width: 'fit-content' }}
        >
          {predefOpen
            ? 'Hide'
            : `View All (${predefinedMetadata.length - visibleLimit})`}
        </AppButton>
      </Grid>
    );
  }

  let collapsedCustom;
  if (customMetadata?.length > visibleLimit) {
    collapsedCustom = (
      <Grid container flexDirection="column">
        <Collapse
          in={customOpen}
          timeout="auto"
          unmountOnExit
          sx={{ mt: 0.5 }}
        >
          {customOpen ? (
            <Grid container>
              {customMetadata?.slice(visibleLimit + 1).map(item => (
                <MetadataItemContainer
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
          size="small"
          color="tertiary"
          onClick={() => setCustomOpen(!customOpen)}
        >
          {customOpen
            ? 'Hide'
            : `View All (${customMetadata.length - visibleLimit})`}
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
              <Typography variant="h4">Custom</Typography>
              <MetadataCreateFormContainer
                dataEntityId={dataEntityId}
                btnCreateEl={
                  <AppButton
                    size="medium"
                    color="primaryLight"
                    startIcon={<AddIcon />}
                  >
                    Add metadata
                  </AppButton>
                }
              />
            </SubtitleContainer>
          </Grid>
          {customMetadata.length ? (
            customMetadata
              ?.slice(0, visibleLimit)
              .map(item => (
                <MetadataItemContainer
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
              alignItems="center"
              justifyContent="flex-start"
              wrap="nowrap"
            >
              <Typography variant="subtitle2">Not created.</Typography>
              <MetadataCreateFormContainer
                dataEntityId={dataEntityId}
                btnCreateEl={
                  <AppButton
                    sx={{ ml: 0.5 }}
                    size="small"
                    color="tertiary"
                  >
                    Add Metadata
                  </AppButton>
                }
              />
            </Grid>
          )}
        </Grid>
        {collapsedCustom}
      </Grid>
      <Grid item container>
        <Grid container>
          <Grid item xs={12}>
            <SubtitleContainer>
              <Typography variant="h4">Pre-defined</Typography>
            </SubtitleContainer>
          </Grid>
          {predefinedMetadata?.slice(0, visibleLimit).map(item => (
            <MetadataItemContainer
              dataEntityId={dataEntityId}
              metadataItem={item}
              key={item.field.id}
            />
          ))}
        </Grid>
        {collapsedPredefined}
      </Grid>
    </>
  );
};

export default OverviewMetadata;
