import { Grid, Paper, Typography } from '@material-ui/core';
import React from 'react';
import { DataEntityDetails } from 'generated-sources';
import OverviewDescriptionContainer from './OverviewDescription/OverviewDescriptionContainer';
import OverviewMetadataContainer from './OverviewMetadata/OverviewMetadataContainer';
import OverviewStatsContainer from './OverviewStats/OverviewStatsContainer';
import OverviewTags from './OverviewTags/OverviewTags';
import { StylesType } from './OverviewStyles';
import OverviewGeneralContainer from './OverviewGeneral/OverviewGeneralContainer';
import OverviewDataQualityReportContainer from './OverviewDataQualityReport/OverviewDataQualityReportContainer';

interface OverviewProps extends StylesType {
  dataEntityId: number;
  dataEntityDetails: DataEntityDetails;
  isDataset: boolean;
  isLoaded: boolean;
}

const Overview: React.FC<OverviewProps> = ({
  classes,
  dataEntityId,
  dataEntityDetails,
  isDataset,
}) => (
  <div className={classes.container}>
    {dataEntityDetails ? (
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <Paper elevation={9} className={classes.sectionContainer}>
            <OverviewStatsContainer dataEntityId={dataEntityId} />
          </Paper>
          <Typography variant="h3" className={classes.sectionCaption}>
            Metadata
          </Typography>
          <Paper square elevation={0} className={classes.sectionContainer}>
            <OverviewMetadataContainer dataEntityId={dataEntityId} />
          </Paper>
          <Typography variant="h3" className={classes.sectionCaption}>
            About
          </Typography>
          <Paper square elevation={0} className={classes.sectionContainer}>
            <OverviewDescriptionContainer dataEntityId={dataEntityId} />
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper square elevation={0} className={classes.sectionContainer}>
            <OverviewGeneralContainer
              dataEntityId={dataEntityDetails.id}
            />
          </Paper>
          {isDataset ? (
            <Paper
              square
              elevation={0}
              className={classes.sectionContainer}
            >
              <OverviewDataQualityReportContainer
                dataEntityId={dataEntityId}
              />
            </Paper>
          ) : null}
          <Paper square elevation={0} className={classes.sectionContainer}>
            <OverviewTags
              tags={dataEntityDetails.tags}
              dataEntityId={dataEntityId}
            />
          </Paper>
        </Grid>
      </Grid>
    ) : null}
  </div>
);

export default Overview;
