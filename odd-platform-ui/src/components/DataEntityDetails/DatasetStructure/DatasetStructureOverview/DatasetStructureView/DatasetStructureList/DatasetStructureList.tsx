import React, {
  type FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { DataSetField } from 'generated-sources';
import { useDataEntityRouteParams } from 'routes';
import { DataEntityTypeContext } from 'components/shared/contexts';
import { Box } from '@mui/material';
import { AddIcon } from 'components/shared/icons';
import { Button } from 'components/shared/elements';
import { useTranslation } from 'react-i18next';
import ColumnForm from 'components/shared/elements/forms/CreateColumnForm';
import useStructure from '../../lib/useStructure';
import DatasetStructureItem from './DatasetStructureItem/DatasetStructureItem';
import * as S from './DatasetStructureList.styles';

const DatasetStructureList: FC = () => {
  const { dataEntityId, versionId } = useDataEntityRouteParams();
  const { datasetStructureRoot, idxToScroll, isSearchUpdated } = useStructure();
  const dataEntityType = useContext(DataEntityTypeContext);
  const { t } = useTranslation();

  const containerRef = useRef<HTMLDivElement>(null);
  const structureLength = useMemo(
    () => datasetStructureRoot.length || 0,
    [datasetStructureRoot.length]
  );

  const virtualizer = useVirtualizer({
    count: structureLength,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 46,
    overscan: 20,
  });

  const items = virtualizer.getVirtualItems();

  useEffect(() => {
    if (idxToScroll > -1) {
      virtualizer.scrollToIndex(idxToScroll, { align: 'start' });
    }
  }, [isSearchUpdated]);

  const initialStateOpen = useCallback(
    (nesting: number) =>
      (structureLength < 5 && nesting < 2) || (structureLength < 20 && nesting < 1),
    [structureLength]
  );

  const renderStructureItem = useCallback(
    (field: DataSetField, nesting: number, rowHeight?: number) => (
      <DatasetStructureItem
        key={field.id}
        dataEntityId={dataEntityId}
        versionId={versionId}
        datasetField={field}
        nesting={nesting}
        initialStateOpen={initialStateOpen(nesting)}
        renderStructureItem={renderStructureItem}
        rowHeight={rowHeight}
      />
    ),
    [initialStateOpen, dataEntityId, versionId]
  );

  return (
    <S.Scrollable ref={containerRef}>
      <S.Container $height={virtualizer.getTotalSize()}>
        <S.ItemContainer $translateY={items[0].start}>
          {items.map(({ key, index, size }) => (
            <div key={key} data-index={index} ref={virtualizer.measureElement}>
              {renderStructureItem(datasetStructureRoot[index], 0, size)}
            </div>
          ))}
          {dataEntityType?.name === 'LOOKUP_TABLE' && (
            <Box
              display='flex'
              alignItems='center'
              pl={1}
              height={theme => theme.spacing(6)}
            >
              <ColumnForm
                btnEl={
                  <Button
                    text={t('Add column')}
                    buttonType='tertiary-m'
                    startIcon={<AddIcon />}
                  />
                }
                lookupTableId={0}
              />
            </Box>
          )}
        </S.ItemContainer>
      </S.Container>
    </S.Scrollable>
  );
};

export default DatasetStructureList;
