import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import TruncateMarkup from 'react-truncate-markup';

interface TruncatedListProps<Item> {
  items: Item[];
  children: (item: Item) => ReactElement;
  ellipsis: ReactNode;
  lines?: number;
}

const TruncatedList = <Item,>({
  items,
  lines = 1,
  ellipsis,
  children,
}: TruncatedListProps<Item>) => (
  <TruncateMarkup lines={lines} ellipsis={ellipsis}>
    <div>
      {items.map((item, idx) => (
        // eslint-disable-next-line react/no-array-index-key
        <TruncateMarkup.Atom key={idx}>{children(item)}</TruncateMarkup.Atom>
      ))}
    </div>
  </TruncateMarkup>
);

export default TruncatedList;
