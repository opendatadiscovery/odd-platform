import React from 'react';
import { SearchFormData } from 'generated-sources';
import { useHistory } from 'react-router-dom';
import { TagItem } from 'components/shared';
import { useAppPaths } from 'lib/hooks';
import { createDataEntitiesSearch } from 'redux/thunks';
import { getTagsList } from 'redux/selectors';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';

const TopTagsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { searchPath } = useAppPaths();

  const topTagsList = useAppSelector(getTagsList);
  const [searchLoading, setSearchLoading] = React.useState(false);

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

  const sortedTags = React.useMemo(
    () =>
      topTagsList
        .filter(tag => tag.important)
        .concat(topTagsList.filter(tag => !tag.important)),
    [topTagsList]
  );

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
