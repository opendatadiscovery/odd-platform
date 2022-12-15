import React from 'react';
import { parse, stringify, type StringifyOptions } from 'query-string';
import { useHistory, useLocation } from 'react-router-dom';

type QueryParams<Params extends Record<string, unknown>> = {
  [Key in keyof Params]: Params[Key] | null;
};

type SetURLQueryParams<Params extends Record<string, unknown>> = (
  value: QueryParams<Params> | ((prev: QueryParams<Params>) => QueryParams<Params>)
) => void;

interface UseQueryParamsReturn<Params extends Record<string, unknown>> {
  queryParams: QueryParams<Params>;
  setQueryParams: SetURLQueryParams<Params>;
}

const useQueryParams = <Params extends Record<string, unknown>>(
  defaultVal?: Params
): UseQueryParamsReturn<Params> => {
  const history = useHistory();
  const location = useLocation();

  const queryStringOptions: StringifyOptions = { arrayFormat: 'comma' };
  const createQueryString = (params: QueryParams<Params>) =>
    stringify(params, queryStringOptions);
  const createQueryParams = (queryStr: string) =>
    parse(queryStr, { ...queryStringOptions, parseNumbers: true, parseBooleans: true });

  const queryParams = React.useMemo(() => {
    if (location.search) return createQueryParams(location.search) as QueryParams<Params>;
    if (defaultVal) return defaultVal;

    return {} as QueryParams<Params>;
  }, [location.search]);

  const setQueryParams = React.useCallback<SetURLQueryParams<Params>>(
    value => {
      const newParams = typeof value === 'function' ? value(queryParams) : value;
      const newQueryStr = createQueryString(newParams);
      history.replace(`${location.pathname}?${newQueryStr}`);
    },
    [history, location.search]
  );

  return { queryParams, setQueryParams };
};

export default useQueryParams;
