import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Asset } from 'generated-sources';
import {
  DatasourceLogo,
  EntityClassItem,
  EntityStatus,
  NumberFormatted,
  TagItem,
  TruncatedCell,
} from 'components/shared/elements';
import { ColumnsIcon, RowsIcon } from 'components/shared/icons';
import { useAppDateTime } from 'lib/hooks';
import { assetKindSingularLabel } from 'components/Favorites/lib';
import {
  columnApplies,
  type CellValue,
  type ResultColumn,
} from 'lib/search/resultColumns';
import { EmptyCell, VisuallyHidden } from '../Results.styles';

interface ResultCellProps {
  column: ResultColumn;
  asset: Asset;
}

/**
 * ST-13a (#1847) — one optional column's cell for one row. Two decisions, in order: does the column APPLY to this
 * row (its kind, and for a class-specific column the data entity's classes — decided from the catalog, before the
 * value is read) → "Not applicable"; then does the row HAVE a value (`column.read`) → the value, else "No value"
 * (owners get their own label, "No owner"). Both empty states are an em dash with visually-hidden text, so a screen
 * reader announces the state instead of skipping a blank (the GitLab Pajamas rule; CTRIB-073 R4).
 *
 * The renderer switches on the VALUE's kind, never on the column id — the catalog is the only place that knows
 * where a value comes from; this component only knows how each kind of value looks.
 */
const ResultCell: React.FC<ResultCellProps> = ({ column, asset }) => {
  const { t } = useTranslation();
  const { formatDistanceToNowStrict, dataEntityFormattedDateTime } = useAppDateTime();

  if (!columnApplies(column, asset)) {
    return (
      <EmptyCell data-testid='search-cell-not-applicable'>
        <span aria-hidden='true'>—</span>
        <VisuallyHidden>{t('Not applicable')}</VisuallyHidden>
      </EmptyCell>
    );
  }
  const value: CellValue | undefined = column.read?.(asset);
  if (value === undefined) {
    return (
      <EmptyCell data-testid='search-cell-no-value'>
        <span aria-hidden='true'>—</span>
        <VisuallyHidden>
          {column.id === 'owners' ? t('No owner') : t('No value')}
        </VisuallyHidden>
      </EmptyCell>
    );
  }
  switch (value.kind) {
    case 'text':
      return (
        <Typography
          variant='body1'
          noWrap
          title={value.text}
          sx={value.mono ? { fontFamily: 'monospace' } : undefined}
        >
          {value.text}
        </Typography>
      );
    case 'date': {
      const text =
        value.style === 'relative'
          ? formatDistanceToNowStrict(value.at, { addSuffix: true })
          : dataEntityFormattedDateTime(value.at.getTime());
      return (
        <Typography variant='body1' noWrap title={text}>
          {text}
        </Typography>
      );
    }
    case 'number':
      return (
        <Typography variant='body1' noWrap sx={{ display: 'flex', alignItems: 'center' }}>
          {value.icon === 'rows' && <RowsIcon sx={{ mr: 0.5 }} />}
          {value.icon === 'columns' && <ColumnsIcon sx={{ mr: 0.5 }} />}
          <NumberFormatted value={value.value} />
        </Typography>
      );
    case 'status':
      return <EntityStatus entityStatus={value.status} />;
    case 'datasource':
      return (
        <Box display='flex' alignItems='center' overflow='hidden'>
          <DatasourceLogo
            name={value.oddrn ?? value.name}
            width={24}
            padding={0.5}
            backgroundColor='default'
          />
          <Typography variant='body1' noWrap title={value.name} sx={{ ml: 0.5 }}>
            {value.name}
          </Typography>
        </Box>
      );
    case 'refs':
      return <TruncatedCell dataList={value.refs} externalEntityId={value.entityId} />;
    case 'tags':
      return (
        <Grid container flexWrap='wrap' gap={0.5}>
          {value.tags.map(tag => (
            <TagItem key={tag.id} label={tag.name} important={tag.important} />
          ))}
        </Grid>
      );
    case 'owners':
      return (
        <Grid container direction='column' alignItems='flex-start'>
          {value.owners.map(ownership => (
            <Typography
              key={ownership.id}
              variant='body1'
              noWrap
              title={
                ownership.title
                  ? `${ownership.owner.name} · ${ownership.title.name}`
                  : ownership.owner.name
              }
            >
              {ownership.owner.name}
            </Typography>
          ))}
        </Grid>
      );
    case 'link':
      return (
        <Typography variant='body1' noWrap title={value.href}>
          <a
            href={value.href}
            target='_blank'
            rel='noopener noreferrer'
            onClick={event => event.stopPropagation()}
          >
            {value.href}
          </a>
        </Typography>
      );
    case 'type':
      return (
        <>
          <Typography
            variant='body1'
            noWrap
            title={t(assetKindSingularLabel[value.assetKind])}
          >
            {t(assetKindSingularLabel[value.assetKind])}
          </Typography>
          {value.entityClasses?.map(entityClass => (
            <EntityClassItem
              sx={{ ml: 0.5 }}
              key={entityClass.id}
              entityClassName={entityClass.name}
            />
          ))}
        </>
      );
    default:
      return null;
  }
};

export default ResultCell;
