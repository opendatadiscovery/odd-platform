import React, { type FC } from 'react';
import { Typography } from '@mui/material';
import type { TermRef } from 'generated-sources';
import { AppTooltip, Markdown } from 'components/shared/elements';
import { useTermWiki } from 'lib/hooks';
import { updateDataSetFieldDescription } from 'redux/thunks';
import { InformationIcon } from 'components/shared/icons';
import * as S from './TermDefinition.styles';

interface TermDefinitionProps {
  termId: number;
  definition: string;
  terms: TermRef[] | undefined;
}

const TermDefinition: FC<TermDefinitionProps> = ({ definition, termId, terms }) => {
  const { transformDescriptionToMarkdown } = useTermWiki({
    terms,
    description: definition,
    entityId: termId,
    updateDescription: updateDataSetFieldDescription,
    isDatasetField: false,
  });

  const tooltipInfoContent = (
    <S.Tooltip>
      You can link an existing term by entering information about the term according to
      the pattern [[NamespaceName:TermName]]
      <br />
      <br />
      <b>Example: This entity describes [[Finance:User]]</b>
    </S.Tooltip>
  );

  return (
    <>
      <S.Definition>
        <Typography variant='h2' mr={1}>
          Definition
        </Typography>
        <AppTooltip title={tooltipInfoContent} checkForOverflow={false}>
          <InformationIcon width={14} height={14} />
        </AppTooltip>
      </S.Definition>
      <Markdown value={transformDescriptionToMarkdown(definition)} />
    </>
  );
};

export default TermDefinition;
