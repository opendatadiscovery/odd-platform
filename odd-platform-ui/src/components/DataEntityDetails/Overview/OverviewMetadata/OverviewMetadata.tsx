import React from 'react';
import { Typography, Grid, Collapse } from '@mui/material';
import { MetadataFieldValue } from 'generated-sources';
import AddIcon from 'components/shared/Icons/AddIcon';
import AppButton from 'components/shared/AppButton/AppButton';
import MetadataCreateFormContainer from 'components/DataEntityDetails/Metadata/MetadataCreateForm/MetadataCreateFormContainer';
import MetadataItemContainer from './MetadataItem/MetadataItemContainer';
import { StylesType } from './OverviewMetadataStyles';

interface OverviewMetadataProps extends StylesType {
  dataEntityId: number;
  predefinedMetadata: MetadataFieldValue[];
  customMetadata: MetadataFieldValue[];
}

const OverviewMetadata: React.FC<OverviewMetadataProps> = ({
  classes,
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
      <>
        <Collapse
          className={classes.collapseContainer}
          in={predefOpen}
          timeout="auto"
          unmountOnExit
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
          className={classes.viewAllBtn}
          onClick={() => setPredefOpen(!predefOpen)}
        >
          {predefOpen
            ? 'Hide'
            : `View All (${predefinedMetadata.length - visibleLimit})`}
        </AppButton>
      </>
    );
  }

  let collapsedCustom;
  if (customMetadata?.length > visibleLimit) {
    collapsedCustom = (
      <>
        <Collapse
          className={classes.collapseContainer}
          in={customOpen}
          timeout="auto"
          unmountOnExit
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
          className={classes.viewAllBtn}
          size="small"
          color="tertiary"
          onClick={() => setCustomOpen(!customOpen)}
        >
          {customOpen
            ? 'Hide'
            : `View All (${customMetadata.length - visibleLimit})`}
        </AppButton>
      </>
    );
  }
  return (
    <>
      <Grid item container>
        <Grid container>
          <Grid item xs={12}>
            <div className={classes.subtitleContainer}>
              <Typography variant="h4" className={classes.subtitle}>
                Custom
              </Typography>
              <div>
                <MetadataCreateFormContainer
                  dataEntityId={dataEntityId}
                  btnCreateEl={
                    <AppButton
                      size="medium"
                      color="primaryLight"
                      onClick={() => {}}
                      icon={<AddIcon />}
                    >
                      Add metadata
                    </AppButton>
                  }
                />
              </div>
            </div>
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
                    onClick={() => {}}
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
            <div className={classes.subtitleContainer}>
              <Typography variant="h4" className={classes.subtitle}>
                Pre-defined
              </Typography>
            </div>
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
