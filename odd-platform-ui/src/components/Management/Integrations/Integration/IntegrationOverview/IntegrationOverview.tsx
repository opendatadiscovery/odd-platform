import React, { type FC } from 'react';
import { Grid, Typography } from '@mui/material';
import type { IntegrationTextBlock } from 'generated-sources';
import MDEditor from '@uiw/react-md-editor';

interface IntegrationOverviewProps {
  textBlocks: IntegrationTextBlock[];
}

const IntegrationOverview: FC<IntegrationOverviewProps> = ({ textBlocks }) => {
  const getTextBlock = (block: IntegrationTextBlock) => (
    <Grid container key={block.title} flexDirection='column' mb={2}>
      <Typography variant='h3' mb={1}>
        {block.title}
      </Typography>
      <MDEditor.Markdown source={block.content} />
    </Grid>
  );

  return (
    <Grid container flexDirection='column' p={2}>
      {textBlocks.map(getTextBlock)}
    </Grid>
  );
};

export default IntegrationOverview;
