import React from 'react';
import { Grid, Typography } from '@mui/material';
import { CloseIcon } from 'components/shared/Icons';
import { AppIconButton } from 'components/shared';
import { TermRef } from 'generated-sources';
import { deleteDataEntityTerm } from 'redux/thunks';
import { useAppPaths, usePermissions } from 'lib/hooks';
import { useAppDispatch } from 'redux/lib/hooks';
import * as S from './TermItemStyles';

interface TermItemProps {
  dataEntityId: number;
  term: TermRef;
}

const TermItem: React.FC<TermItemProps> = ({ dataEntityId, term }) => {
  const dispatch = useAppDispatch();
  const { termDetailsOverviewPath } = useAppPaths();
  const termDetailsLink = termDetailsOverviewPath(term.id);
  const { isAllowedTo: editDataEntity } = usePermissions({ dataEntityId });

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    return dispatch(deleteDataEntityTerm({ dataEntityId, termId: term.id }));
  };

  return (
    <S.TermItemContainer to={termDetailsLink}>
      <Grid sx={{ my: 0.5 }} container flexWrap='nowrap' justifyContent='space-between'>
        <Grid container flexDirection='column'>
          <Typography variant='body1' color='texts.action'>
            {term.name}
          </Typography>
          <S.TermDefinition variant='subtitle2'>{term.definition}</S.TermDefinition>
        </Grid>
        <S.ActionsContainer>
          {editDataEntity && (
            <AppIconButton
              size='small'
              color='unfilled'
              icon={<CloseIcon />}
              onClick={handleDelete}
              sx={{ ml: 0.25 }}
            />
          )}
        </S.ActionsContainer>
      </Grid>
    </S.TermItemContainer>
  );
};

export default TermItem;
