import type { MouseEventHandler, ReactElement } from 'react';
import React, { cloneElement, isValidElement, useState } from 'react';
import TruncateMarkup from 'react-truncate-markup';

interface EllipsisNode extends ReactElement {
  props: {
    onClick?: MouseEventHandler;
  };
}

interface TruncatedListProps<Item> {
  items: Item[];
  children: (item: Item) => ReactElement;
  ellipsis: (isExpanded: boolean) => EllipsisNode;
  lines?: number;
}

const TruncatedList = <Item,>({
  items,
  lines = 1,
  ellipsis,
  children,
}: TruncatedListProps<Item>) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const ellipsisNode = ellipsis(isExpanded);

  const ellipsisWithOnClick = isValidElement(ellipsisNode)
    ? cloneElement(ellipsisNode, {
        onClick: (event: React.MouseEvent<HTMLElement>) => {
          ellipsisNode.props?.onClick?.(event);
          toggleExpanded();
        },
      })
    : ellipsisNode;

  return (
    <div>
      {isExpanded ? (
        <>
          <div>{items.map(item => children(item))}</div>
          {isExpanded && ellipsisWithOnClick}
        </>
      ) : (
        <TruncateMarkup lines={lines} ellipsis={ellipsisWithOnClick}>
          <div>
            {items.map((item, idx) => (
              // eslint-disable-next-line react/no-array-index-key
              <TruncateMarkup.Atom key={idx}>{children(item)}</TruncateMarkup.Atom>
            ))}
          </div>
        </TruncateMarkup>
      )}
    </div>
  );
};

export default TruncatedList;
