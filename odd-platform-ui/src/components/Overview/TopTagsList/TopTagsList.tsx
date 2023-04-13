import React from 'react';
import { TagItem } from 'components/shared';
import { useCreateSearch } from 'lib/hooks';
import { useAppSelector } from 'redux/lib/hooks';
import { getTagListFetchingStatuses, getTagsList } from 'redux/selectors';

const TopTagsList: React.FC = () => {
  const createSearch = useCreateSearch();

  const topTags = useAppSelector(getTagsList);
  const { isNotLoaded: isTagsNotFetched } = useAppSelector(getTagListFetchingStatuses);

  const handleTagClick = React.useCallback(
    (id: number, name: string) => () => {
      const searchFormData = {
        query: '',
        filters: { tags: [{ entityId: id, entityName: name, selected: true }] },
      };
      createSearch(searchFormData);
    },
    []
  );

  const sortedTags = React.useMemo(
    () =>
      topTags.filter(tag => tag.important).concat(topTags.filter(tag => !tag.important)),
    [topTags]
  );

  return (
    <>
      {isTagsNotFetched
        ? null
        : sortedTags.map(tag => (
            <TagItem
              onClick={handleTagClick(tag.id, tag.name)}
              key={tag.id}
              label={tag.name}
              important={tag.important}
              cursorPointer
              sx={{ m: 0.5 }}
            />
          ))}
    </>
  );
};

export default TopTagsList;
