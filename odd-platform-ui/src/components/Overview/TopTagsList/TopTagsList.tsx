import React from 'react';
import type { SearchFormData } from 'generated-sources';
import { useNavigate } from 'react-router-dom';
import { TagItem } from 'components/shared';
import { useAppPaths } from 'lib/hooks';
import { createDataEntitiesSearch } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { getTagListFetchingStatuses, getTagsList } from 'redux/selectors';

const TopTagsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { searchPath } = useAppPaths();

  const topTags = useAppSelector(getTagsList);
  const { isNotLoaded: isTagsNotFetched } = useAppSelector(getTagListFetchingStatuses);

  const handleTagClick = React.useCallback(
    (id: number, name: string) => () => {
      const searchQuery: SearchFormData = {
        query: '',
        filters: { tags: [{ entityId: id, entityName: name, selected: true }] },
      };
      dispatch(createDataEntitiesSearch({ searchFormData: searchQuery }))
        .unwrap()
        .then(({ searchId }) => {
          const searchLink = searchPath(searchId);
          navigate(searchLink);
        });
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
