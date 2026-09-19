import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AppPopover, Button, Checkbox } from 'components/shared/elements';
import { ChevronIcon, ColumnsIcon } from 'components/shared/icons';
import {
  OPTIONAL_RESULT_COLUMN_IDS,
  RESULT_COLUMNS,
  RESULT_COLUMN_BY_ID,
  RESULT_COLUMN_GROUP_LABEL,
  columnGroup,
  isDefaultLayout,
  type ResultColumn,
  type ResultColumnGroupKey,
} from 'lib/search/resultColumns';
import type { ResultColumnsState } from 'lib/hooks';

type ColumnsPickerProps = ResultColumnsState;

const GROUP_ORDER: ResultColumnGroupKey[] = [
  'common',
  'DATA_ENTITY',
  'TERM',
  'QUERY_EXAMPLE',
];

/**
 * ST-13a (#1847, ADR unified-asset-search D7) — the result-column constructor: a `Columns` button in the results
 * header (the `AppPopover` + `renderOpenBtn` idiom the Saved-searches control beside it uses) opening a checklist
 * of the field catalog grouped by what a column applies to — Common (two or three kinds), then per kind. Each
 * optional column is a checkbox row with Move up / Move down buttons (reorder without drag — the NN/G data-table
 * rule; the buttons name their column for assistive tech); the two anchors are shown as locked rows; `Reset to
 * default` restores the seven-column default; the trigger's badge (`shown/total`) is the visible "some columns
 * are hidden" indicator. The state lives in `useResultColumns` (owned by Results.tsx); this component only
 * renders it and calls the three actions.
 */
const ColumnsPicker: React.FC<ColumnsPickerProps> = ({
  columns,
  toggle,
  move,
  reset,
}) => {
  const { t } = useTranslation();

  const groups = React.useMemo(() => {
    const byGroup = new Map<ResultColumnGroupKey, ResultColumn[]>();
    RESULT_COLUMNS.filter(column => !column.fixed).forEach(column => {
      const key = columnGroup(column);
      byGroup.set(key, [...(byGroup.get(key) ?? []), column]);
    });
    return GROUP_ORDER.filter(key => byGroup.has(key)).map(key => ({
      key,
      columns: byGroup.get(key)!,
    }));
  }, []);

  const shown = columns.length + 2;
  const total = OPTIONAL_RESULT_COLUMN_IDS.length + 2;
  const nameColumn = RESULT_COLUMN_BY_ID.get('name')!;
  const recencyColumn = RESULT_COLUMN_BY_ID.get('recently_viewed')!;

  const renderRow = (column: ResultColumn) => {
    const active = columns.includes(column.id);
    const index = columns.indexOf(column.id);
    const label = t(column.labelKey);
    return (
      <Grid
        key={column.id}
        container
        item
        wrap='nowrap'
        alignItems='center'
        sx={{ px: 1.5, py: 0.25, columnGap: 0.5 }}
        data-testid={`search-columns-row-${column.id}`}
      >
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            flexGrow: 1,
            cursor: 'pointer',
          }}
        >
          <Checkbox checked={active} onChange={() => toggle(column.id)} />
          <Typography variant='body1' sx={{ ml: 0.5 }}>
            {label}
          </Typography>
        </label>
        <Button
          buttonType='tertiary-m-icon'
          icon={<ChevronIcon transform='rotate(180)' />}
          aria-label={t('Move {{column}} up', { column: label })}
          disabled={!active || index <= 0}
          onClick={() => move(column.id, 'up')}
          data-testid={`search-columns-up-${column.id}`}
        />
        <Button
          buttonType='tertiary-m-icon'
          icon={<ChevronIcon />}
          aria-label={t('Move {{column}} down', { column: label })}
          disabled={!active || index < 0 || index >= columns.length - 1}
          onClick={() => move(column.id, 'down')}
          data-testid={`search-columns-down-${column.id}`}
        />
      </Grid>
    );
  };

  const renderLockedRow = (column: ResultColumn) => (
    <Grid
      key={column.id}
      container
      item
      wrap='nowrap'
      alignItems='center'
      sx={{ px: 1.5, py: 0.25, columnGap: 0.5 }}
      data-testid={`search-columns-row-${column.id}`}
    >
      <label style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
        <Checkbox checked disabled />
        <Typography variant='body1' sx={{ ml: 0.5 }}>
          {t(column.labelKey)}
        </Typography>
      </label>
      <Typography
        variant='subtitle2'
        color='texts.hint'
        data-testid='search-columns-fixed'
      >
        {t('Fixed column')}
      </Typography>
    </Grid>
  );

  return (
    <AppPopover
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: -8, horizontal: 'right' }}
      childrenSx={{ p: 0 }}
      renderOpenBtn={({ onClick, ariaDescribedBy }) => (
        <Button
          aria-describedby={ariaDescribedBy}
          aria-label={t('Result columns')}
          buttonType='tertiary-m'
          text={`${t('Columns')} ${shown}/${total}`}
          startIcon={<ColumnsIcon />}
          // the header row beside it is a full-width grid: without this the trigger is the flex item that gives
          // way and its own label reads "Columns 9…" (measured at 1280–1920 px)
          sx={{ flexShrink: 0 }}
          onClick={onClick}
          data-testid='search-columns-trigger'
        />
      )}
    >
      <Grid
        container
        flexDirection='column'
        wrap='nowrap'
        role='group'
        aria-label={t('Result columns')}
        sx={{ width: 360, maxHeight: 480, overflowY: 'auto', py: 0.5 }}
        data-testid='search-columns-picker'
      >
        <Grid
          container
          item
          wrap='nowrap'
          alignItems='center'
          justifyContent='space-between'
          sx={{ px: 1.5, py: 0.75 }}
        >
          <Typography variant='h4'>{t('Result columns')}</Typography>
          <Button
            buttonType='tertiary-m'
            text={t('Reset to default')}
            disabled={isDefaultLayout(columns)}
            onClick={reset}
            data-testid='search-columns-reset'
          />
        </Grid>
        {renderLockedRow(nameColumn)}
        {groups.map(group => (
          <React.Fragment key={group.key}>
            <Typography variant='subtitle1' sx={{ px: 1.5, pt: 1, pb: 0.25 }}>
              {t(RESULT_COLUMN_GROUP_LABEL[group.key])}
            </Typography>
            {group.columns.map(renderRow)}
          </React.Fragment>
        ))}
        {renderLockedRow(recencyColumn)}
      </Grid>
    </AppPopover>
  );
};

export default ColumnsPicker;
