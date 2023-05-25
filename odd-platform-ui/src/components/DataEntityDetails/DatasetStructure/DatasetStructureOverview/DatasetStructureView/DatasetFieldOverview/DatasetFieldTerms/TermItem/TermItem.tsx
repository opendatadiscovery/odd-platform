import React, { type FC, useCallback } from 'react';
import type { TermRef } from 'generated-sources';
import { Permission } from 'generated-sources';
import { Grid, Typography } from '@mui/material';
import WithPermissions from 'components/shared/contexts/Permission/WithPermissions';
import Button from 'components/shared/elements/Button/Button';
import CloseIcon from 'components/shared/icons/CloseIcon';
import { useAppPaths, useDeleteDatasetFieldTerm } from 'lib/hooks';
import * as S from './TermItem.styles';

interface TermItemProps {
  name: TermRef['name'];
  definition: TermRef['definition'];
  termId: TermRef['id'];
  datasetFieldId: number;
  removeTerm: (termId: number) => void;
}

const TermItem: FC<TermItemProps> = ({
  name,
  definition,
  termId,
  datasetFieldId,
  removeTerm,
}) => {
  const { mutateAsync: deleteTerm } = useDeleteDatasetFieldTerm();

  const { termDetailsOverviewPath } = useAppPaths();
  const termDetailsLink = termDetailsOverviewPath(termId);

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      deleteTerm({ datasetFieldId, termId }).then(() => removeTerm(termId));
    },
    [deleteTerm, datasetFieldId, termId, removeTerm]
  );

  return (
    <S.TermItemContainer to={termDetailsLink}>
      <Grid sx={{ my: 0.5 }} container flexWrap='nowrap' justifyContent='space-between'>
        <Grid container flexDirection='column'>
          <Typography variant='body1' color='texts.action'>
            {name}
          </Typography>
          <S.TermDefinition variant='subtitle2'>{definition}</S.TermDefinition>
        </Grid>
        <S.ActionsContainer>
          <WithPermissions permissionTo={Permission.DATASET_FIELD_DELETE_TERM}>
            <Button
              sx={{ ml: 0.25 }}
              buttonType='linkGray-m'
              icon={<CloseIcon />}
              onClick={handleDelete}
            />
          </WithPermissions>
        </S.ActionsContainer>
      </Grid>
    </S.TermItemContainer>
  );
};

export default TermItem;
