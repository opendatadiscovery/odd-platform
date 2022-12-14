import React from 'react';
import { parse, type ParsedQuery, stringify, type StringifyOptions } from 'query-string';
import { useHistory } from 'react-router-dom';

type QueryParams = ParsedQuery<string | boolean | number>;
type SetURLQueryParams = (
  value: QueryParams | ((prev: QueryParams) => QueryParams)
) => void;

interface UseQueryParamsReturn {
  queryParams: QueryParams;
  setQueryParams: SetURLQueryParams;
}

const useQueryParams = (): UseQueryParamsReturn => {
  const history = useHistory();

  const queryStringOptions: StringifyOptions = { arrayFormat: 'comma' };
  const createQueryString = (params: QueryParams) =>
    stringify(params, queryStringOptions);
  const createQueryParams = (queryStr: string) =>
    parse(queryStr, { ...queryStringOptions, parseNumbers: true, parseBooleans: true });

  const queryParams = React.useMemo(
    () => createQueryParams(history.location.search),
    [history.location.search]
  );

  const setQueryParams = React.useCallback<SetURLQueryParams>(
    value => {
      const newParams = typeof value === 'function' ? value(queryParams) : value;
      const newQueryStr = createQueryString(newParams);
      history.replace(`${history.location.pathname}?${newQueryStr}`);
    },
    [history, queryParams]
  );

  return { queryParams, setQueryParams };
};

export default useQueryParams;
