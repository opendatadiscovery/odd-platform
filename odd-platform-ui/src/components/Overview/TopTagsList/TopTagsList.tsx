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
import { StylesType } from './TopTagsListStyles';

interface TopTagsListProps extends StylesType {
  topTagsList: Tag[];
  createDataEntitiesSearch: (
    params: SearchApiSearchRequest
  ) => Promise<SearchFacetsData>;
}

const TopTagsList: React.FC<TopTagsListProps> = ({
  classes,
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

  return (
    <>
      {topTagsList
        .sort((tag1, tag2) => {
          if (tag1.important === tag2.important) {
            return tag1.name.localeCompare(tag2.name);
          }
          return tag1.important ? -1 : 1;
        })
        .map(tag => (
          <TagItem
            onClick={handleTagClick(tag.id, tag.name)}
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
