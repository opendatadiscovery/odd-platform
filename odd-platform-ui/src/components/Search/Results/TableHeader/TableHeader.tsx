import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AppTooltip } from 'components/shared/elements';
import { DataEntityClassLabelMap } from 'lib/constants';
import type { AssetKind, DataEntityClassNameEnum } from 'generated-sources';
import {
  RESULT_COLUMN_GROUP_LABEL,
  minWidthFor,
  resolveResultColumns,
  type ResultColumn,
  type ResultColumnId,
} from 'lib/search/resultColumns';
import * as S from '../Results.styles';

interface TableHeaderProps {
  /** the active layout (the optional column ids, in order) — owned by Results.tsx */
  columns: ResultColumnId[];
}

/**
 * ST-13a (#1847) — the results header, rendered FROM THE LAYOUT: the left anchor, the optional columns in the
 * user's order, the right anchor — each header cell as wide as its catalog `minWidth`, the header as wide as
 * their sum. Every optional header carries a tooltip naming what the column applies to ("Applies to: Data
 * Entities, Terms" / "Applies to: Datasets"), plus the column's own note where one is needed (the two clocks
 * behind "Updated"; the description precedence) — the one explanation per column that replaces one per cell
 * (CTRIB-073 R4). Name pins left and Recently-viewed pins right while the middle columns scroll.
 */
const TableHeader: React.FC<TableHeaderProps> = ({ columns }) => {
  const { t } = useTranslation();
  const rendered = React.useMemo(() => resolveResultColumns(columns), [columns]);
  const minWidth = React.useMemo(() => minWidthFor(columns), [columns]);

  const appliesTo = (column: ResultColumn): string => {
    const names = column.entityClasses
      ? column.entityClasses.map(entityClass =>
          t(
            DataEntityClassLabelMap.get(entityClass as DataEntityClassNameEnum)?.plural ??
              entityClass
          )
        )
      : column.kinds.map(kind => t(RESULT_COLUMN_GROUP_LABEL[kind as AssetKind]));
    return `${t('Applies to')}: ${names.join(', ')}`;
  };

  return (
    <S.ResultsTableHeader container sx={{ mt: 2 }} wrap='nowrap' $minWidth={minWidth}>
      {rendered.map(column => {
        const label = <Typography variant='caption'>{t(column.labelKey)}</Typography>;
        return (
          <S.SearchCol
            key={column.id}
            item
            $width={column.minWidth}
            $grow={column.fixed === 'left'}
            $sticky={column.fixed === 'left'}
            $stickyRight={column.fixed === 'right'}
            data-testid={`search-header-${column.id}`}
          >
            {column.fixed ? (
              label
            ) : (
              <AppTooltip
                checkForOverflow={false}
                followCursor={false}
                title={
                  <>
                    <div>{appliesTo(column)}</div>
                    {column.noteKey && <div>{t(column.noteKey)}</div>}
                  </>
                }
              >
                <S.HeaderLabel
                  type='button'
                  data-testid={`search-header-label-${column.id}`}
                >
                  {label}
                </S.HeaderLabel>
              </AppTooltip>
            )}
          </S.SearchCol>
        );
      })}
    </S.ResultsTableHeader>
  );
};

export default TableHeader;
