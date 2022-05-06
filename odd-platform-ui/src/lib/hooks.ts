import React from 'react';
import { useParams } from 'react-router-dom';

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
}

interface AppRouteParams {
  dataEntityId: number;
}

export const useAppParams = (): AppRouteParams => {
  const { dataEntityId } = useParams<RouteParams>();

  return {
    dataEntityId: parseInt(dataEntityId, 10),
  };
};
