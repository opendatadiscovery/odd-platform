import React, { type FC, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { Permission, type TermRef } from 'generated-sources';
import { WithPermissions } from 'components/shared/contexts';
import {
  Button,
  CollapsibleInfoContainer,
  InfoItem,
  Markdown,
} from 'components/shared/elements';
import { DeleteIcon, LinkedTermIcon } from 'components/shared/icons';
import { useDeleteDatasetFieldTerm } from 'lib/hooks';
import { termDetailsPath } from 'routes';
import { Link } from 'react-router-dom';

interface TermItemProps {
  name: TermRef['name'];
  definition: TermRef['definition'];
  termId: TermRef['id'];
  datasetFieldId: number;
  isDescriptionLink: boolean;
  removeTerm: (termId: number) => void;
}

const TermItem: FC<TermItemProps> = ({
  name,
  definition,
  termId,
  datasetFieldId,
  removeTerm,
  isDescriptionLink,
}) => {
  const { mutateAsync: deleteTerm } = useDeleteDatasetFieldTerm();

  const termDetailsLink = termDetailsPath(termId, 'overview');

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      deleteTerm({ datasetFieldId, termId })
        .then(() => removeTerm(termId))
        .catch();
    },
    [deleteTerm, datasetFieldId, termId, removeTerm]
  );

  return (
    <InfoItem
      label={
        <Box p={0.75} display='flex' flexWrap='nowrap' alignItems='center'>
          <Link to={termDetailsLink}>
            <Typography color='button.link.normal.color'>{name}</Typography>
          </Link>
          {isDescriptionLink && <LinkedTermIcon />}
        </Box>
      }
      info={
        <CollapsibleInfoContainer
          content={<Markdown value={definition} />}
          actions={
            !isDescriptionLink ? (
              <WithPermissions permissionTo={Permission.DATASET_FIELD_DELETE_TERM}>
                <Button
                  sx={{ mt: 0.25 }}
                  buttonType='link-m'
                  icon={<DeleteIcon />}
                  onClick={handleDelete}
                />
              </WithPermissions>
            ) : undefined
          }
        />
      }
    />
  );
};

export default TermItem;
