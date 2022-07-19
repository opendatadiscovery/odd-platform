import React from 'react';
import { useParams } from 'react-router-dom';
import {
  AlertViewType,
  ManagementViewType,
  TermsViewType,
  TestReportViewType,
} from 'lib/interfaces';
import { parse, stringify, StringifyOptions } from 'query-string';

/**
 * Find out dynamically size of scrollbar width of client's browser.
 * For Chrome default is 15px
 * @param {number} width in px - default scrollbar width if hook failed.
 * @returns {string} - scrollbar width in px or default value if calculated value for scrollbar is 0.
 */
export const useScrollBarWidth: (width?: number) => string = (
  width = 15
) => {
  const [scrollbarWidth, setScrollbarWidth] = React.useState<string>(
    `${width}px`
  );
  React.useEffect(() => {
    const scrollDiv = document.createElement('div');
    scrollDiv.style.overflow = 'scroll';
    document.body.appendChild(scrollDiv);
    const calculatedScrollbarWidth = `${
      scrollDiv.offsetWidth - scrollDiv.clientWidth || width
    }px`;
    document.body.removeChild(scrollDiv);
    setScrollbarWidth(calculatedScrollbarWidth);
  }, []);
  return scrollbarWidth;
};

// useAppParams react-router
interface RouteParams {
  dataEntityId: string;
  dataQATestId: string;
  termId: string;
  viewType: TermsViewType | AlertViewType | ManagementViewType;
}

interface AppRouteParams {
  dataEntityId: number;
  dataQATestId: number;
  termId: number;
  viewType:
    | TermsViewType
    | AlertViewType
    | ManagementViewType
    | TestReportViewType;
}

export const useAppParams = (): AppRouteParams => {
  const { dataEntityId, termId, viewType, dataQATestId } =
    useParams<RouteParams>();

  return {
    dataEntityId: parseInt(dataEntityId, 10),
    dataQATestId: parseInt(dataQATestId, 10),
    termId: parseInt(termId, 10),
    viewType,
  };
};

export const useAppQuery = <QueryParams extends object>(
  queryParams?: QueryParams,
  queryString?: string
): { query: string; params: QueryParams } => {
  const queryStringOptions: StringifyOptions = {
    arrayFormat: 'bracket-separator',
    arrayFormatSeparator: '|',
  };

  const query = queryParams
    ? stringify(queryParams, queryStringOptions)
    : '';
  const params = queryString
    ? (parse(queryString, {
        ...queryStringOptions,
        parseNumbers: true,
      }) as unknown as QueryParams)
    : ({} as QueryParams);

  return { query, params };
};
