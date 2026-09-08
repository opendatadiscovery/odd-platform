import React from 'react';
import { Slider } from '@mui/material';
import RangeFacetShell from '../RangeFacetShell/RangeFacetShell';
import * as S from './RangeFacetFilterStyles';

/** One stop of the rail — a discrete band the slider snaps to. `label` is the thumb's value label, `ariaText` what a screen reader speaks. */
export interface RangeFacetStop {
  value: number;
  label: string;
  ariaText: string;
  /** how many results sit in this band (drives the bar); omitted = no bars */
  count?: number;
}

export interface RangeFacetPreset {
  label: string;
  range: [number, number];
}

export interface RangeFacetFilterProps {
  /** the visible heading ("Popularity") — the rail's label idiom */
  name: string;
  /** a space-free id for the DOM hooks: `filter-<filterId>-slider|chip|info|disabled` */
  filterId: string;
  /** the one-line scope qualifier under the heading ("Data entities only") */
  qualifier?: string;
  /** the inline help (ADR-0076); one short record per idea - see {@link RangeFacetShell}'s `help` */
  help?: string | readonly string[];
  /** the rail, ascending by value; the caller already restricted it to the bands that exist (∪ the selection) */
  stops: ReadonlyArray<RangeFacetStop>;
  /** the selection in stop VALUES; an undefined bound = that end of the rail */
  selected?: { min?: number; max?: number };
  /** commit a new selection; `undefined` = clear. A selection spanning the whole rail commits as `undefined`. */
  onCommit: (range: { min?: number; max?: number } | undefined) => void;
  /** the chip text for the current selection */
  chipText: string;
  presets?: ReadonlyArray<RangeFacetPreset>;
  /** when set, the rail cannot be used and this says why (rendered instead of the slider) */
  disabledReason?: string;
  /** the bar strip's accessible name */
  barsLabel: string;
  /** the two thumbs' accessible names, low then high */
  thumbLabels: [string, string];
}

/**
 * The numeric RANGE facet body (ST-9 / #1843) — the first non-categorical facet in the Filters rail. Since ST-10
 * (#1844) the surrounding chrome (heading, inline help, qualifier, presets, chip) lives in {@link RangeFacetShell},
 * which the datetime facets instance with a picker body instead; this component keeps the bars + slider and its own
 * public props unchanged. It knows nothing about popularity:
 * it renders a bar per stop, a two-thumb
 * MUI `Slider` that SNAPS to the stops (`step={null}` + marks — 21 discrete bands are a preset list rendered
 * spatially, so false continuity is avoided), optional preset links, and the standard filter chip with its ×.
 *
 * The slider works in stop INDICES (so the thumbs move one band per step whatever the values are) and translates to
 * values on commit. A selection that spans the whole rail commits as "no range" — the price-slider convention: both
 * handles at the ends means no filter, and it keeps a bookmark from freezing today's observed extremes.
 *
 * Two guarded states, both deliberate: `disabledReason` (the caller knows the rail cannot narrow anything — e.g. every
 * result sits in one band) renders the reason instead of the slider; and fewer than two stops renders NO slider even
 * without a reason, because a one-stop rail is not a range control (MUI computes NaN positions for min == max). In
 * both cases an existing selection still renders its chip, so it can always be cleared.
 *
 * Keyboard: MUI's thumbs handle ←/→, Home/End natively; `onChangeCommitted` fires on key-up and mouse-up, so a drag
 * repaints locally and writes ONCE.
 */
const RangeFacetFilter: React.FC<RangeFacetFilterProps> = ({
  name,
  filterId,
  qualifier,
  help,
  stops,
  selected,
  onCommit,
  chipText,
  presets,
  disabledReason,
  barsLabel,
  thumbLabels,
}) => {
  const lastIndex = stops.length - 1;
  const indexOf = React.useCallback(
    (value: number | undefined, fallback: number) => {
      if (value === undefined) return fallback;
      const idx = stops.findIndex(stop => stop.value === value);
      return idx === -1 ? fallback : idx;
    },
    [stops]
  );
  const committed = React.useMemo<[number, number]>(
    () => [indexOf(selected?.min, 0), indexOf(selected?.max, lastIndex)],
    [indexOf, selected, lastIndex]
  );
  // Local thumb positions while dragging; re-synced whenever the committed selection or the rail changes.
  const [position, setPosition] = React.useState<[number, number]>(committed);
  React.useEffect(() => setPosition(committed), [committed]);

  const hasSelection = selected?.min !== undefined || selected?.max !== undefined;
  const canSlide = !disabledReason && stops.length >= 2;
  // Bar heights are square-root scaled: a real catalog's view counts are heavy-tailed (the never-viewed band
  // holds more than half the entities), and on a linear scale every other band collapses to a hairline —
  // seen on a 126k-asset corpus in the pixel review. sqrt keeps the order of the bars and the exact counts stay
  // in each bar's title / the strip's aria text.
  const maxCount = Math.max(0, ...stops.map(stop => stop.count ?? 0));
  const showBars = canSlide && maxCount > 0;

  const commit = React.useCallback(
    (lo: number, hi: number) => {
      const min = lo <= 0 ? undefined : stops[lo]?.value;
      const max = hi >= lastIndex ? undefined : stops[hi]?.value;
      onCommit(min === undefined && max === undefined ? undefined : { min, max });
    },
    [stops, lastIndex, onCommit]
  );

  // The gate stays HERE, not in the shell, and it has TWO conditions: no reason set AND at least two stops. The
  // second is not redundant — a one-stop rail with a selection reaches this with no reason at all, and MUI computes
  // NaN thumb positions for min === max. Passing `children`/`presets` conditionally keeps both shipped states exact.
  return (
    <RangeFacetShell
      name={name}
      filterId={filterId}
      qualifier={qualifier}
      help={help}
      chipText={hasSelection ? chipText : ''}
      onClear={() => onCommit(undefined)}
      disabledReason={canSlide ? undefined : disabledReason}
      presets={
        canSlide && presets && presets.length > 0
          ? presets.map(preset => ({
              label: preset.label,
              onSelect: () => onCommit({ min: preset.range[0], max: preset.range[1] }),
            }))
          : undefined
      }
    >
      {canSlide ? (
        <>
          {showBars && (
            <S.Bars role='img' aria-label={barsLabel} data-qa={`filter-${filterId}-bars`}>
              {stops.map((stop, idx) => (
                <S.Bar
                  key={stop.value}
                  $active={idx >= position[0] && idx <= position[1]}
                  $heightPct={Math.sqrt((stop.count ?? 0) / maxCount) * 100}
                  title={`${stop.ariaText}: ${stop.count ?? 0}`}
                />
              ))}
            </S.Bars>
          )}
          <S.SliderRow>
            <Slider
              size='small'
              value={position}
              min={0}
              max={lastIndex}
              step={null}
              marks={stops.map((_, idx) => ({ value: idx }))}
              disableSwap
              valueLabelDisplay='auto'
              valueLabelFormat={idx => stops[idx]?.label ?? ''}
              getAriaLabel={idx => thumbLabels[idx] ?? ''}
              getAriaValueText={idx => stops[idx]?.ariaText ?? ''}
              onChange={(_, value) => setPosition(value as [number, number])}
              onChangeCommitted={(_, value) => {
                const [lo, hi] = value as [number, number];
                commit(lo, hi);
              }}
              data-qa={`filter-${filterId}-slider`}
            />
          </S.SliderRow>
        </>
      ) : null}
    </RangeFacetShell>
  );
};

export default RangeFacetFilter;
