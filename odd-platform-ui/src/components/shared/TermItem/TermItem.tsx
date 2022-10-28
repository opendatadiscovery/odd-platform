import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Permission, TermRef } from 'generated-sources';
import { deleteDataEntityTerm } from 'redux/thunks';
import { useAppPaths } from 'lib/hooks';
import { useAppDispatch } from 'redux/lib/hooks';
import { WithPermissions } from 'components/shared/contexts';
import { CloseIcon } from 'components/shared/Icons';
import { AppIconButton } from 'components/shared/index';
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
          <WithPermissions
            permissionTo={Permission.DATA_ENTITY_DELETE_TERM}
            resourceId={dataEntityId}
          >
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
