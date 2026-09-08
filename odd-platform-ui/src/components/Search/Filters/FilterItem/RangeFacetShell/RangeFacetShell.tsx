import React from 'react';
import { Grid, Typography } from '@mui/material';
import { AppTooltip, Button } from 'components/shared/elements';
import { TooltipBody } from 'components/shared/elements/AppTooltip/AppTooltipStyles';
import { ClearIcon, InformationIcon } from 'components/shared/icons';
import { Label } from 'components/shared/elements/Input/Input.styles';
import { Chip } from '../FixedOptionsMultiFilter/FixedOptionsMultiFilterStyles';
import * as S from './RangeFacetShellStyles';

/** A preset link under the rail body: a label and what clicking it commits. */
export interface RangeFacetShellPreset {
  label: string;
  onSelect: () => void;
}

export interface RangeFacetShellProps {
  /** the visible heading ("Popularity", "Last viewed") — the rail's label idiom */
  name: string;
  /** a space-free id for the DOM hooks: `filter-<filterId>-info|chip|disabled` */
  filterId: string;
  /** the one-line scope qualifier under the heading ("Data entities only") */
  qualifier?: string;
  /**
   * The inline help behind the information icon (ADR-0076). Pass ONE SHORT RECORD PER IDEA, not a paragraph:
   * each entry renders as its own line, so a reader scans three facts instead of parsing one run-on sentence.
   * A single string is still accepted for the trivial one-fact case.
   */
  help?: string | readonly string[];
  /** preset links rendered with the body; omit them when the body itself is not usable */
  presets?: ReadonlyArray<RangeFacetShellPreset>;
  /**
   * Where the presets sit relative to the body. `after` (the default) is the numeric-range shape: the slider IS
   * the control and "Never viewed" is the shortcut beside it. `before` is the date shape, where the relationship
   * inverts — almost every reader wants Today / Last 7 days, and only the rare one opens a calendar. Putting the
   * common path under the rare one is what made this rail feel like work.
   */
  presetsPlacement?: 'before' | 'after';
  /** the chip text for the current selection; EMPTY means no selection, so no chip */
  chipText: string;
  /** clear the selection (the chip's ×) */
  onClear: () => void;
  /** when set, the body cannot be used and this says why (rendered instead of `children`) */
  disabledReason?: string;
  /** the rail body — a slider, a date picker, whatever the facet's dimension needs */
  children?: React.ReactNode;
}

/**
 * The shared CHROME of a range facet — heading, inline help, qualifier, body slot, preset links and the chip with
 * its ×. Extracted from `RangeFacetFilter` (ST-9 / #1843) when the datetime facet (ST-10 / #1844) needed the same
 * chrome around a completely different body: a numeric range is SLID, a date range is PICKED. ST-11's
 * created/updated ranges instance it a third time.
 *
 * <p><b>The shell renders what it is given and never second-guesses the caller.</b> `children` and `presets` appear
 * only when passed, and the caller decides when to pass them — deliberately, because the shipped guard it replaces
 * has TWO conditions, not one: `RangeFacetFilter` hides its slider when there is a `disabledReason` AND ALSO when
 * the rail has fewer than two stops (MUI computes NaN positions for `min === max`). That second state is reachable
 * with no reason set — one occupied band plus a selection — so a shell that gated on `disabledReason` alone would
 * render a dead slider there, and a clickable preset under it. Keeping the gate in the caller keeps both states
 * exactly as they shipped.
 *
 * <p>The chip is gated on a non-empty `chipText` rather than on a `selected` prop the shell would have to
 * understand: `PopularityFilter` already passes `''` when nothing is selected, so the two conditions coincide, and
 * a facet whose selection is not a numeric range can express "nothing selected" the same way.
 */
const RangeFacetShell: React.FC<RangeFacetShellProps> = ({
  name,
  filterId,
  qualifier,
  help,
  presets,
  presetsPlacement = 'after',
  chipText,
  onClear,
  disabledReason,
  children,
}) => {
  // One shape downstream: a caller may pass a single sentence or a list of records; the tooltip renders lines.
  const helpRecords = React.useMemo(
    () => (help === undefined ? [] : typeof help === 'string' ? [help] : [...help]),
    [help]
  );

  const presetRow =
    presets && presets.length > 0 ? (
      <S.Presets container>
        {presets.map(preset => (
          <Button
            key={preset.label}
            text={preset.label}
            buttonType='linkGray-m'
            onClick={preset.onSelect}
            data-qa={`filter-${filterId}-preset`}
          />
        ))}
      </S.Presets>
    ) : null;

  return (
    <Grid container sx={{ mt: 2 }} data-qa={`filter-${filterId}`}>
      <Grid container alignItems='center' wrap='nowrap'>
        <Label>{name}</Label>
        {helpRecords.length > 0 && (
          <AppTooltip
            checkForOverflow={false}
            title={
              /* Its own SHARED TooltipBody, because the help is a LIST of records rendered one per line — a
               plain string would get the same body from AppTooltip itself. The body brings the padding, the 360px
               wrap and the card border; the "light" popper deliberately brings none (AppTooltipStyles). */
              <TooltipBody data-qa='tooltip-body'>
                {helpRecords.map(record => (
                  <S.HelpRecord key={record}>{record}</S.HelpRecord>
                ))}
              </TooltipBody>
            }
          >
            {/* the hook lives on a plain span: MUI's styled SvgIcon does not forward unknown DOM props */}
            <span
              data-qa={`filter-${filterId}-info`}
              style={{ display: 'inline-flex', marginLeft: 4 }}
            >
              <InformationIcon width={14} height={14} />
            </span>
          </AppTooltip>
        )}
      </Grid>
      {qualifier && (
        <Typography variant='subtitle2' color='texts.info' sx={{ width: '100%' }}>
          {qualifier}
        </Typography>
      )}
      {presetsPlacement === 'before' && presetRow}
      {children}
      {presetsPlacement === 'after' && presetRow}
      {disabledReason && (
        <Typography
          variant='subtitle2'
          color='texts.hint'
          sx={{ width: '100%' }}
          data-qa={`filter-${filterId}-disabled`}
        >
          {disabledReason}
        </Typography>
      )}
      {chipText && (
        <Grid display='inline-flex' item xs={12} sx={{ my: 0.25, mx: -0.25 }} container>
          <Chip container data-qa={`filter-${filterId}-chip`}>
            {/* WRAPS, never truncates. The chip is the only place that states what is actually applied - the
              docs promise it "always names the resolved moments" - so "Last viewed: since Sep 2, 2..." in a
              180px rail defeats its whole purpose. A second line costs nothing here. */}
            <Typography
              sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
              title={chipText}
            >
              {chipText}
            </Typography>
            <Button
              sx={{ ml: 0.5 }}
              buttonType='linkGray-m'
              icon={<ClearIcon />}
              onClick={onClear}
              aria-label={`${name}: ${chipText}`}
            />
          </Chip>
        </Grid>
      )}
    </Grid>
  );
};

export default RangeFacetShell;
