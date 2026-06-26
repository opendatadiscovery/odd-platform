import React, { type FC } from 'react';
import { Box } from '@mui/material';
import { TagItem } from 'components/shared/elements';
import useStructure from '../../../lib/useStructure';

// The tags present across the dataset's columns, rendered as clickable filter chips
// (#1679). Clicking a chip toggles a client-side filter over the already-loaded
// structure — the same one-click gesture the catalog Overview uses (TopTagsList),
// scoped here to one dataset's columns. Each chip shows how many columns carry the tag.
const DatasetStructureTagFilters: FC = () => {
  const { availableTags, selectedTagIds, toggleTagFilter } = useStructure();

  if (availableTags.length === 0) return null;

  return (
    <>
      {availableTags.map(tag => (
        <Box
          key={tag.id}
          component='span'
          data-qa='dataset-structure-tag-filter'
          sx={{ display: 'inline-flex' }}
        >
          <TagItem
            label={tag.name}
            important={tag.important}
            systemTag={tag.external}
            count={tag.count}
            cursorPointer
            selected={selectedTagIds.includes(tag.id)}
            onClick={() => toggleTagFilter(tag.id)}
            sx={{ m: 0.5 }}
          />
        </Box>
      ))}
    </>
  );
};

export default DatasetStructureTagFilters;
