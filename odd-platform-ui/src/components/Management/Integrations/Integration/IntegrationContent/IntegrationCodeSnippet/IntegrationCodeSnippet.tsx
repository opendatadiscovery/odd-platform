import React, { type FC } from 'react';
import type { IntegrationCodeSnippet as IntegrationCodeSnippetType } from 'generated-sources';
import { Markdown } from 'components/shared/elements';
import { Grid } from '@mui/material';

interface IntegrationCodeSnippetProps {
  snippet: IntegrationCodeSnippetType;
}

const IntegrationCodeSnippet: FC<IntegrationCodeSnippetProps> = ({ snippet }) => (
  <Grid container mb={1}>
    <Markdown value={snippet.template} />
  </Grid>
);

export default IntegrationCodeSnippet;
