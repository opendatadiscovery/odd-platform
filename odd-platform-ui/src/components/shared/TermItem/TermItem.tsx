import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Permission, type TermRef } from 'generated-sources';
import { deleteDataEntityTerm } from 'redux/thunks/dataentities.thunks';
import { useAppPaths } from 'lib/hooks';
import { useAppDispatch } from 'redux/lib/hooks';
import CloseIcon from '../Icons/CloseIcon';
import WithPermissions from '../contexts/Permission/WithPermissions';
import AppIconButton from '../AppIconButton/AppIconButton';
import * as S from './TermItemStyles';

interface TermItemProps {
  dataEntityId: number;
  term: TermRef;
}

const TermItem: React.FC<TermItemProps> = ({ dataEntityId, term }) => {
  const dispatch = useAppDispatch();
  const { termDetailsOverviewPath } = useAppPaths();
  const termDetailsLink = termDetailsOverviewPath(term.id);

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
          <WithPermissions permissionTo={Permission.DATA_ENTITY_DELETE_TERM}>
            <AppIconButton
              size='small'
              color='unfilled'
              icon={<CloseIcon />}
              onClick={handleDelete}
              sx={{ ml: 0.25 }}
            />
          </WithPermissions>
        </S.ActionsContainer>
      </Grid>
    </S.TermItemContainer>
  );
};

export default TermItem;
