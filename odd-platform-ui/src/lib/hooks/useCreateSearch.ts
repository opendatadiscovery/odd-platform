import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SearchFormData } from 'generated-sources';
import { createDataEntitiesSearch } from 'redux/thunks';
import { useAppDispatch } from 'redux/lib/hooks';
import { searchPath } from 'routes';

export default function useCreateSearch() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return useCallback(
    (searchFormData: SearchFormData) => {
      dispatch(createDataEntitiesSearch({ searchFormData }))
        .unwrap()
        .then(({ searchId }) => {
          const searchLink = searchPath(searchId);
          navigate(searchLink);
        });
    },
    [dispatch, createDataEntitiesSearch, searchPath, navigate]
  );
}
