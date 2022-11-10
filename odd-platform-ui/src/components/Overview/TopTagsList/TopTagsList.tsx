import React from 'react';
import { SearchFormData, Tag } from 'generated-sources';
import { useHistory } from 'react-router-dom';
import { TagItem } from 'components/shared';
import { useAppPaths } from 'lib/hooks';
import { createDataEntitiesSearch } from 'redux/thunks';
import { useAppDispatch } from 'redux/lib/hooks';

interface TopTagListProps {
  topTags: Tag[];
  isTagsNotFetched: boolean;
}

const TopTagsList: React.FC<TopTagListProps> = ({ topTags, isTagsNotFetched }) => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { searchPath } = useAppPaths();

  const [searchLoading, setSearchLoading] = React.useState(false);

  const handleTagClick = React.useCallback(
    (id: number, name: string) => () => {
      if (searchLoading) return;
      setSearchLoading(true);
      const searchQuery: SearchFormData = {
        query: '',
        filters: { tags: [{ entityId: id, entityName: name, selected: true }] },
      };
      dispatch(createDataEntitiesSearch({ searchFormData: searchQuery }))
        .unwrap()
        .then(({ searchId }) => {
          const searchLink = searchPath(searchId);
          history.replace(searchLink);
        });
      history.push(searchPath());
    },
    [searchLoading, setSearchLoading, createDataEntitiesSearch, history]
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
