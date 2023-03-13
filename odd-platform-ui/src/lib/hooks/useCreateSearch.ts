import React from 'react';
import type { SearchFormData } from 'generated-sources';
import { createDataEntitiesSearch } from 'redux/thunks';
import { useAppDispatch } from 'redux/lib/hooks';
import { useNavigate } from 'react-router-dom';
import useAppPaths from 'lib/hooks/useAppPaths/useAppPaths';

const useCreateSearch = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { searchPath } = useAppPaths();

  return React.useCallback((searchFormData: SearchFormData) => {
    dispatch(createDataEntitiesSearch({ searchFormData }))
      .unwrap()
      .then(({ searchId }) => {
        const searchLink = searchPath(searchId);
        navigate(searchLink);
      });
  }, []);
};

export default useCreateSearch;
