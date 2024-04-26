import React from 'react';
import { Box, Typography } from '@mui/material';
import type { LinkedTerm } from 'generated-sources';
import { termDetailsPath } from 'routes';
import { TermLinkedTermsColContainer } from '../LinkedTermsListStyles';
import { Container, EntityLink, NameContainer } from './LinkedTermStyles';

interface LinkedTermProps {
  linkedTerm: LinkedTerm;
}

const LinkedTermView: React.FC<LinkedTermProps> = ({ linkedTerm }) => {
  const detailsLink = termDetailsPath(linkedTerm.term.id);

  return (
    <EntityLink to={detailsLink}>
      <Container container>
        <TermLinkedTermsColContainer
          $colType='colmd'
          item
          container
          justifyContent='space-between'
          wrap='nowrap'
        >
          <NameContainer container item>
            <Box display='flex' flexWrap='nowrap' alignItems='center' overflow='hidden'>
              <Typography ml={0.5} variant='body1' noWrap title={linkedTerm.term.name}>
                {linkedTerm.term.name}
              </Typography>
            </Box>
          </NameContainer>
        </TermLinkedTermsColContainer>
        <TermLinkedTermsColContainer item $colType='collg'>
          <Typography variant='body1' title={linkedTerm.term.namespace?.name} noWrap>
            {linkedTerm.term.namespace?.name}
          </Typography>
        </TermLinkedTermsColContainer>
      </Container>
    </EntityLink>
  );
};

export default LinkedTermView;
