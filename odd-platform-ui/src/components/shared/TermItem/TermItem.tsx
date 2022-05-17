import React from 'react';
import { Grid, Typography } from '@mui/material';
import CloseIcon from 'components/shared/Icons/CloseIcon';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import {
  DataEntityApiDeleteTermFromDataEntityRequest,
  TermRef,
} from 'generated-sources';
import { termDetailsOverviewPath } from 'lib/paths';
import * as S from './TermItemStyles';

interface TermItemProps {
  dataEntityId: number;
  term: TermRef;
  deleteDataEntityTerm: (
    params: DataEntityApiDeleteTermFromDataEntityRequest
  ) => Promise<void>;
}

const TermItem: React.FC<TermItemProps> = ({
  dataEntityId,
  term,
  deleteDataEntityTerm,
}) => {
  const termDetailsLink = termDetailsOverviewPath(term.id);

  return (
    <S.TermItemContainer to={termDetailsLink}>
      <Grid
        sx={{ my: 0.5 }}
        container
        flexWrap="nowrap"
        justifyContent="space-between"
      >
        <Grid container flexDirection="column">
          <Typography variant="body1" color="texts.action">
            {term.name}
          </Typography>
          <S.TermDefinition variant="subtitle2">
            {term.definition}
          </S.TermDefinition>
        </Grid>
        <S.ActionsContainer>
          <AppIconButton
            size="small"
            color="unfilled"
            icon={<CloseIcon />}
            onClick={e => {
              e.preventDefault();
              return deleteDataEntityTerm({
                dataEntityId,
                termId: term.id,
              });
            }}
            sx={{ ml: 0.25 }}
          />
        </S.ActionsContainer>
      </Grid>
    </S.TermItemContainer>
  );
};

export default TermItem;
