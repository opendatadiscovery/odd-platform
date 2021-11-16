import React, { CSSProperties } from 'react';
import { VariableSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import VirtualRow from 'components/shared/VirtualRow/VirtualRow';
import { DataSetField } from 'generated-sources';
import DatasetStructureItemContainer from 'components/DataEntityDetails/DatasetStructure/DatasetStructureTable/DatasetStructureItem/DatasetStructureItemContainer';
import { set } from 'react-hook-form';

interface VirtualListProps {
  // data: Array<JSX.Element | null>;
  // rowCount: number;
  dataEntityId: number;
  versionId?: number;
  datasetStructureRoot: DataSetField[];
  datasetRowsCount: number;
}

export const DynamicListContext = React.createContext<
  Partial<{ setSize: (index: number, size: number) => void }>
>({});

const VirtualList: React.FC<VirtualListProps> = ({
  // data,
  // rowCount,
  dataEntityId,
  datasetRowsCount,
  datasetStructureRoot,
  versionId,
}) => {
  const listRef = React.useRef<VariableSizeList | null>(null);
  const rowRef = React.useRef<HTMLDivElement | null>(null);

  const [sizeMap, setSizeMap] = React.useState<{ [key: string]: number }>(
    {}
  );

  const setSize = React.useCallback(
    (
      index: number,
      ref: React.MutableRefObject<HTMLDivElement | null>
    ) => () => {
      console.log(index, ref.current?.getBoundingClientRect().height);
      const rowHeight = ref.current?.getBoundingClientRect().height;
      setSizeMap({ ...sizeMap, [index]: rowHeight });
      // if (listRef.current) {
      //   // console.log('Eff!');
      //   listRef.current.resetAfterIndex(0);
      // }
    },
    []
  );

  const rootStructureItems = datasetStructureRoot.filter(
    field => !field.parentFieldId
  );

  const renderStructureItem = React.useCallback(
    (field: DataSetField, nesting: number, onSizeChange: () => void) => (
      <DatasetStructureItemContainer
        key={field.id}
        dataEntityId={dataEntityId}
        versionId={versionId}
        datasetField={field}
        nesting={nesting}
        rowsCount={datasetRowsCount}
        onSizeChange={onSizeChange}
        initialStateOpen={
          (datasetStructureRoot?.length < 5 && nesting < 2) ||
          (datasetStructureRoot?.length < 20 && nesting < 1)
        }
        renderStructureItem={renderStructureItem}
      />
    ),
    [datasetStructureRoot, datasetRowsCount, dataEntityId, versionId]
  );

  const renderListItem = ({
    index,
    style,
    data,
  }: {
    index: number;
    style: CSSProperties;
    data: DataSetField[];
  }) => {
    const onSizeChange = setSize(index, rowRef);
    return (
      <div style={style} ref={rowRef}>
        {renderStructureItem(data[index], 0, onSizeChange)}
      </div>
    );
  };

  const getSize = React.useCallback(index => sizeMap[index], []);

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <AutoSizer>
        {({ height, width }) => (
          <VariableSizeList
            ref={listRef}
            width={width}
            height={height}
            itemData={rootStructureItems}
            itemCount={rootStructureItems.length}
            itemSize={getSize}
            overscanCount={4}
          >
            {({ index, style, data }) =>
              renderListItem({ index, style, data })
            }
          </VariableSizeList>
        )}
      </AutoSizer>
    </div>
  );
};

export default VirtualList;
