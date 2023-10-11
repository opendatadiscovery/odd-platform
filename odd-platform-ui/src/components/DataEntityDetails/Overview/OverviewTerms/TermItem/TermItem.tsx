import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import type { LinkedTerm } from 'generated-sources';
import { Permission } from 'generated-sources';
import { deleteDataEntityTerm } from 'redux/thunks/dataentities.thunks';
import { useAppPaths } from 'lib/hooks';
import { useAppDispatch } from 'redux/lib/hooks';
import { CloseIcon, LinkedTermIcon } from 'components/shared/icons';
import { WithPermissions } from 'components/shared/contexts';
import { Button } from 'components/shared/elements';
import * as S from './TermItem.styles';

interface TermItemProps {
  dataEntityId: number;
  linkedTerm: LinkedTerm;
  isStatusDeleted?: boolean;
}

const TermItem: React.FC<TermItemProps> = ({
  dataEntityId,
  linkedTerm,
  isStatusDeleted,
}) => {
  const dispatch = useAppDispatch();
  const { termDetailsOverviewPath } = useAppPaths();
  const termDetailsLink = termDetailsOverviewPath(linkedTerm.term.id);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    return dispatch(deleteDataEntityTerm({ dataEntityId, termId: linkedTerm.term.id }));
  };

  return (
    <S.TermItemContainer to={termDetailsLink}>
      <Grid sx={{ my: 0.5 }} container flexWrap='nowrap' justifyContent='space-between'>
        <Grid container flexDirection='column'>
          <Box display='flex' flexWrap='nowrap' alignItems='center'>
            <Typography variant='body1' color='texts.action' mr={0.25}>
              {linkedTerm.term.name}
            </Typography>
            {linkedTerm.isDescriptionLink && <LinkedTermIcon />}
          </Box>
          <S.TermDefinition variant='subtitle2'>
            {linkedTerm.term.namespace.name}
          </S.TermDefinition>
        </Grid>
        {!linkedTerm.isDescriptionLink && !isStatusDeleted && (
          <S.ActionsContainer>
            <WithPermissions permissionTo={Permission.DATA_ENTITY_DELETE_TERM}>
              <Button
                sx={{ ml: 0.25 }}
                buttonType='linkGray-m'
                icon={<CloseIcon />}
                onClick={handleDelete}
              />
            </WithPermissions>
          </S.ActionsContainer>
        )}
      </Grid>
    </S.TermItemContainer>
  );
};

export default TermItem;
