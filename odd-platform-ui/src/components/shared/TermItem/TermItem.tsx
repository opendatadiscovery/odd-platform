import React from 'react';
import { Grid, Typography } from '@mui/material';
import CloseIcon from 'components/shared/Icons/CloseIcon';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import { TermRef } from 'generated-sources';
import { termDetailsOverviewPath } from 'lib/paths';
import { useAppDispatch } from 'redux/lib/hooks';
import { deleteDataEntityTerm } from 'redux/thunks';
import { ActionsContainer, TermItemContainer } from './TermItemStyles';

interface TermItemProps {
  dataEntityId: number;
  term: TermRef;
}

const TermItem: React.FC<TermItemProps> = ({ dataEntityId, term }) => {
  const dispatch = useAppDispatch();
  const termDetailsLink = termDetailsOverviewPath(term.id);

  return (
    <TermItemContainer to={termDetailsLink}>
      <Grid
        sx={{ my: 0.5 }}
        container
        flexWrap="nowrap"
        justifyContent="space-between"
      >
        <Typography variant="body1" color="texts.action">
          {term.name}
        </Typography>
        <ActionsContainer>
          <AppIconButton
            size="small"
            color="unfilled"
            icon={<CloseIcon />}
            onClick={e => {
              e.preventDefault();
              return dispatch(
                deleteDataEntityTerm({
                  dataEntityId,
                  termId: term.id,
                })
              );
            }}
            sx={{ ml: 0.25 }}
          />
        </ActionsContainer>
      </Grid>
    </TermItemContainer>
  );
};

export default TermItem;
