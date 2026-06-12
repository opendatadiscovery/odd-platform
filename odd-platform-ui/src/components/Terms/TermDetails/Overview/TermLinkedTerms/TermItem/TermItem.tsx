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
import { useDeleteLinkedTermToTerm } from 'lib/hooks';
import { termDetailsPath } from 'routes';
import { Link } from 'react-router-dom';

interface TermItemProps {
  name: TermRef['name'];
  definition: TermRef['definition'];
  linkedTermId: TermRef['id'];
  termId: number;
  isDescriptionLink: boolean;
  removeTerm: (linkedTermId: number) => void;
}

const TermItem: FC<TermItemProps> = ({
  name,
  definition,
  linkedTermId,
  termId,
  removeTerm,
  isDescriptionLink,
}) => {
  const { mutateAsync: deleteTerm } = useDeleteLinkedTermToTerm({ termId });

  const termDetailsLink = termDetailsPath(linkedTermId, 'overview');

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      removeTerm(linkedTermId);
    },
    [deleteTerm, linkedTermId, removeTerm]
  );

  return (
    <InfoItem
      sx={{ width: '100%' }}
      label={
        <Box p={0.75} display='flex' flexWrap='nowrap' alignItems='center' gap={0.5}>
          <Link to={termDetailsLink}>
            <Typography color='button.link.normal.color'>{name}</Typography>
          </Link>
          {isDescriptionLink && <LinkedTermIcon />}
        </Box>
      }
      info={
        <CollapsibleInfoContainer
          style={{ width: '100%' }}
          content={<Markdown value={definition} />}
          actions={
            !isDescriptionLink ? (
              <WithPermissions permissionTo={Permission.TERM_UPDATE}>
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
