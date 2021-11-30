import React from 'react';
import {
  SearchApiSearchRequest,
  SearchFacetsData,
  SearchFormData,
  Tag,
} from 'generated-sources';
import { useHistory } from 'react-router-dom';
import { searchPath } from 'lib/paths';
import TagItem from 'components/shared/TagItem/TagItem';

interface TopTagsListProps {
  topTagsList: Tag[];
  createDataEntitiesSearch: (
    params: SearchApiSearchRequest
  ) => Promise<SearchFacetsData>;
}

const TopTagsList: React.FC<TopTagsListProps> = ({
  topTagsList,
  createDataEntitiesSearch,
}) => {
  const history = useHistory();
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
      createDataEntitiesSearch({ searchFormData: searchQuery }).then(
        search => {
          const searchLink = searchPath(search.searchId);
          history.replace(searchLink);
        }
      );
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
