import React, { useCallback, useMemo } from 'react';
import { TagItem } from 'components/shared/elements';
import { useCreateSearch } from 'lib/hooks';
import type { Tag } from 'generated-sources';

interface Props {
  tags: Tag[];
}

const TopTagsList = ({ tags }: Props) => {
  const createSearch = useCreateSearch();

  const handleTagClick = useCallback(
    (id: number, name: string) => () => {
      const searchFormData = {
        query: '',
        filters: { tags: [{ entityId: id, entityName: name, selected: true }] },
      };
      createSearch(searchFormData);
    },
    []
  );

  const sortedTags = useMemo(
    () =>
      [...tags].sort((a, b) => {
        if (a.usedCount !== b.usedCount) {
          return (b.usedCount ?? 0) - (a.usedCount ?? 0);
        }

        return b.important ? 1 : -1;
      }),
    [tags]
  );

  return (
    <>
      {sortedTags.map(tag => (
        <TagItem
          onClick={handleTagClick(tag.id, tag.name)}
          key={tag.id}
          label={tag.name}
          important={tag.important}
          count={tag.usedCount}
          cursorPointer
          sx={{ m: 0.5 }}
        />
      ))}
    </>
  );
};

export default TopTagsList;
