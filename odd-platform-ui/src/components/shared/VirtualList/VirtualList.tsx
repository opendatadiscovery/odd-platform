import React from 'react';
import { VariableSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import VirtualRow from 'components/shared/VirtualRow/VirtualRow';

interface VirtualListProps {
  data: Array<JSX.Element | null>;
  rowCount: number;
}

export const DynamicListContext = React.createContext<
  Partial<{ setSize: (index: number, size: number) => void }>
>({});

const VirtualList: React.FC<VirtualListProps> = ({ data, rowCount }) => {
  const listRef = React.useRef<VariableSizeList | null>(null);

  const sizeMap = React.useRef<{ [key: string]: number }>({});

  const setSize = React.useCallback((index: number, size: number) => {
    if (sizeMap.current[index] !== size) {
      sizeMap.current = { ...sizeMap.current, [index]: size };
      if (listRef.current) {
        listRef.current.resetAfterIndex(0);
      }
    }
  }, []);

  const getSize = React.useCallback(index => sizeMap.current[index], []);

  return (
    <DynamicListContext.Provider value={{ setSize }}>
      <div style={{ height: '100vh', width: '100vw' }}>
        <AutoSizer>
          {({ height, width }) => (
            <VariableSizeList
              ref={listRef}
              width={width}
              height={height}
              itemData={data}
              itemCount={rowCount}
              itemSize={getSize}
              overscanCount={4}
            >
              {({ ...props }) => (
                <VirtualRow
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...props}
                  width={width}
                />
              )}
            </VariableSizeList>
          )}
        </AutoSizer>
      </div>
    </DynamicListContext.Provider>
  );
};

export default VirtualList;
