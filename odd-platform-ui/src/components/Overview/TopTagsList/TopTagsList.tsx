import React, { useEffect } from 'react';
import {
  SearchApiSearchRequest,
  SearchFacetsData,
  SearchFormData,
  Tag,
  TagApiGetPopularTagListRequest,
} from 'generated-sources';
import { useHistory } from 'react-router-dom';
import { searchPath } from 'lib/paths';
import TagItem from 'components/shared/TagItem/TagItem';
import { StylesType } from './TopTagsListStyles';

interface TopTagsListProps extends StylesType {
  topTagsList: Tag[];
  fetchTagsList: (params: TagApiGetPopularTagListRequest) => void;
  createDataEntitiesSearch: (
    params: SearchApiSearchRequest
  ) => Promise<SearchFacetsData>;
}

const TopTagsList: React.FC<TopTagsListProps> = ({
  classes,
  topTagsList,
  fetchTagsList,
  createDataEntitiesSearch,
}) => {
  const history = useHistory();
  const [searchLoading, setSearchLoading] = React.useState<boolean>(false);

  useEffect(() => {
    fetchTagsList({ page: 1, size: 20 });
  }, []);

  const handleTagClick = (id: number) => () => {
    if (searchLoading) return;
    setSearchLoading(true);
    const searchQuery: SearchFormData = {
      query: '',
      filters: {
        tags: [{ entityId: id, selected: true }],
      },
    };
    createDataEntitiesSearch({ searchFormData: searchQuery }).then(
      search => {
        const searchLink = searchPath(search.searchId);
        history.push(searchLink);
      }
    );
  };

  return (
    <>
      {topTagsList
        .sort(tag => (tag.important ? -1 : 1))
        .map(tag => (
          <TagItem
            onClick={handleTagClick(tag.id)}
            key={tag.id}
            label={tag.name}
            important={tag.important}
            classes={{ container: classes.tagItem }}
          />
        ))}
    </>
  );
};

export default TopTagsList;
