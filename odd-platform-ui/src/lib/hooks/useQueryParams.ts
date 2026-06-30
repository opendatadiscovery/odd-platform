import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import queryStringPackage, { type StringifyOptions } from 'query-string';

type QueryParams<Params extends object> = {
  [Key in keyof Params]: Params[Key];
};

interface SetQueryParamsOptions {
  /** navigate to this pathname instead of the current one (the canonical /search base for ST-1 / ADR D10) */
  pathname?: string;
  /** replace the current history entry instead of pushing a new one (default: push) */
  replace?: boolean;
}

type SetURLQueryParams<Params extends object> = (
  value: QueryParams<Params> | ((prev: QueryParams<Params>) => QueryParams<Params>),
  options?: SetQueryParamsOptions
) => void;

interface UseQueryParamsReturn<Params extends object> {
  queryParams: QueryParams<Params>;
  queryString: string;
  defaultQueryString: string;
  setQueryParams: SetURLQueryParams<Params>;
}

const useQueryParams = <Params extends object>(
  defaultVal: Params
): UseQueryParamsReturn<Params> => {
  const { stringify, parse } = queryStringPackage;
  const navigate = useNavigate();
  const location = useLocation();

  const queryStringOptions: StringifyOptions = {
    arrayFormat: 'bracket-separator',
    arrayFormatSeparator: ',',
    skipEmptyString: true,
    skipNull: true,
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
    (value, options) => {
      const newParams = typeof value === 'function' ? value(queryParams) : value;
      const newQueryStr = createQueryString(newParams);
      const pathname = options?.pathname ?? location.pathname;
      navigate(`${pathname}?${newQueryStr}`, { replace: options?.replace ?? false });
    },
    [queryParams, location.pathname]
  );

  return React.useMemo(
    () => ({
      queryParams,
      queryString,
      defaultQueryString,
      setQueryParams,
    }),
    [queryParams, queryString, defaultQueryString, setQueryParams]
  );
};

export default useQueryParams;
