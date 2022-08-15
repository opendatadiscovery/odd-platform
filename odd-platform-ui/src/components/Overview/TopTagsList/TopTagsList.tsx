import React from 'react';
import { SearchFormData, Tag } from 'generated-sources';
import { useHistory } from 'react-router-dom';
import TagItem from 'components/shared/TagItem/TagItem';
import { useAppPaths } from 'lib/hooks';
import { useAppDispatch } from 'lib/redux/hooks';
import { createDataEntitiesSearch } from 'redux/thunks';

interface TopTagsListProps {
  topTagsList: Tag[];
}

const TopTagsList: React.FC<TopTagsListProps> = ({ topTagsList }) => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { searchPath } = useAppPaths();
  const [searchLoading, setSearchLoading] = React.useState<boolean>(false);

  const handleTagClick = React.useCallback(
    (id: number, name: string) => () => {
      if (searchLoading) return;
      setSearchLoading(true);
      const searchQuery: SearchFormData = {
        query: '',
        filters: {
          tags: [{ entityId: id, entityName: name, selected: true }],
        },
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

  // sorting by importance and usedCount
  const sortedTags = topTagsList
    .filter(tag => tag.important)
    .concat(topTagsList.filter(tag => !tag.important));

  return (
    <>
      {sortedTags.map(tag => (
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
