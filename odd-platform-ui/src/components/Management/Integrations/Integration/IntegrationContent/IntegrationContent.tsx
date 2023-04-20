import React, { type FC } from 'react';
import { Grid } from '@mui/material';
import type { IntegrationContent as IntegrationContentType } from 'lib/interfaces';
import { Markdown } from 'components/shared/elements';
import IntegrationCodeSnippetWithForm from './IntegrationCodeSnippetWithForm/IntegrationCodeSnippetWithForm';
import IntegrationCodeSnippet from './IntegrationCodeSnippet/IntegrationCodeSnippet';

interface IntegrationContentProps {
  integrationContent: IntegrationContentType;
}

const IntegrationContent: FC<IntegrationContentProps> = ({ integrationContent }) => (
  <Grid container flexDirection='column' p={2}>
    {[...integrationContent.codeSnippets]
      .sort((a, b) => (b?.arguments?.length || 1) - (a?.arguments?.length || 0))
      .map(snippet =>
        snippet.arguments?.length ? (
          <IntegrationCodeSnippetWithForm key={snippet.template} snippet={snippet} />
        ) : (
          <IntegrationCodeSnippet key={snippet.template} snippet={snippet} />
        )
      )}
    <Markdown value={integrationContent.content} />
  </Grid>
);

export default IntegrationContent;
