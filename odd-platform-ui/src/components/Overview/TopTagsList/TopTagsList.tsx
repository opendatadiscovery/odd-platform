import React, { useCallback, useMemo } from 'react';
import { TagItem } from 'components/shared/elements';
import { useNavigateToSearch } from 'lib/hooks';
import type { Tag } from 'generated-sources';

interface Props {
  tags: Tag[];
}

const TopTagsList = ({ tags }: Props) => {
  const navigateToSearch = useNavigateToSearch();

  const handleTagClick = useCallback(
    (id: number) => () => {
      navigateToSearch({ facets: { tags: [id] } });
    },
    [navigateToSearch]
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
          onClick={handleTagClick(tag.id)}
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
