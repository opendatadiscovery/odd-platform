import { parse, stringify, StringifyOptions } from 'query-string';

const useAppQuery = <QueryParams extends object>(
  queryParams?: QueryParams,
  queryString?: string
): { query: string; params: QueryParams } => {
  const queryStringOptions: StringifyOptions = {
    arrayFormat: 'bracket-separator',
    arrayFormatSeparator: '|',
  };

  const query = queryParams ? stringify(queryParams, queryStringOptions) : '';
  const params = queryString
    ? (parse(queryString, {
        ...queryStringOptions,
        parseNumbers: true,
      }) as unknown as QueryParams)
    : ({} as QueryParams);

  return { query, params };
};

export default useAppQuery;
