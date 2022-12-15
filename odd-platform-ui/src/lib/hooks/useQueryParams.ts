import React from 'react';
import { parse, stringify, type StringifyOptions } from 'query-string';
import { useHistory, useLocation } from 'react-router-dom';

type QueryParams<Params extends Record<string, unknown>> = {
  [Key in keyof Params]: Params[Key];
};

type SetURLQueryParams<Params extends Record<string, unknown>> = (
  value: QueryParams<Params> | ((prev: QueryParams<Params>) => QueryParams<Params>)
) => void;

interface UseQueryParamsReturn<Params extends Record<string, unknown>> {
  queryParams: QueryParams<Params>;
  queryString: string;
  defaultQueryString: string;
  setQueryParams: SetURLQueryParams<Params>;
}

const useQueryParams = <Params extends Record<string, unknown>>(
  defaultVal: Params
): UseQueryParamsReturn<Params> => {
  const history = useHistory();
  const location = useLocation();

  const queryStringOptions: StringifyOptions = {
    arrayFormat: 'comma',
    skipEmptyString: true,
  };
  const createQueryString = (params: QueryParams<Params>) =>
    stringify(params, queryStringOptions);
  const createQueryParams = (queryStr: string) =>
    parse(queryStr, { ...queryStringOptions, parseNumbers: true, parseBooleans: true });

  const queryParams = React.useMemo(
    () =>
      location.search
        ? (createQueryParams(location.search) as QueryParams<Params>)
        : defaultVal,
    [location.search, defaultVal]
  );

  const queryString = React.useMemo(() => createQueryString(queryParams), [queryParams]);
  const defaultQueryString = React.useMemo(
    () => createQueryString(defaultVal),
    [defaultVal]
  );

  const setQueryParams = React.useCallback<SetURLQueryParams<Params>>(
    value => {
      const newParams = typeof value === 'function' ? value(queryParams) : value;
      const newQueryStr = createQueryString(newParams);
      history.replace(`${location.pathname}?${newQueryStr}`);
    },
    [history, queryParams, location.pathname]
  );

  return { queryParams, queryString, defaultQueryString, setQueryParams };
};

export default useQueryParams;
