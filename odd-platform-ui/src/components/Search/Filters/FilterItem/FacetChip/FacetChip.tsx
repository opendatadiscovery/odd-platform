import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AppTooltip, Button } from 'components/shared/elements';
import { AddIcon, ClearIcon, ExcludeIcon } from 'components/shared/icons';
import * as S from './FacetChipStyles';

export interface FacetChipProps {
  /** the value's display name (already formatted for its facet) */
  label: string;
  /** the accessible name of the value's controls — "<facet>: <value>" */
  facetName?: string;
  /** ST-11: the chip states an EXCLUSION ("not <value>") */
  excluded?: boolean;
  /**
   * ST-11: flip the value between a positive selection and an exclusion. When absent the chip carries no toggle —
   * the range chips (Popularity, Last viewed) state a window, which has no "not" in this slice.
   */
  onToggleExclude?: () => void;
  /** remove the value (the ×) */
  onRemove: () => void;
  /** a wrapping chip (the range facets' long window text) instead of the single-line default */
  wrap?: boolean;
  /** the DOM hook of the chip container */
  dataQa?: string;
}

/**
 * THE selected-value chip of the Filters rail (ST-11 / #1845 consolidated the two identical chip styles into it):
 * the value, an optional Exclude / Include toggle, and the ×. Both controls are real buttons with an accessible
 * name, so a keyboard user reaches the toggle by Tab and operates it with Enter / Space — an exclusion is never a
 * hover-only or pointer-only gesture.
 *
 * An excluded chip reads `not <value>` (the word is translated with the value interpolated, so a locale can place
 * the negation where its grammar puts it) in the outlined style; its toggle offers "Include" (the + icon), a
 * positive chip's toggle offers "Exclude" (the "not" sign). Each icon button names itself through the platform's
 * compact hint tooltip (the dark `AppTooltip` the (i) hints on a dataset field use), never a native `title`.
 */
const FacetChip: React.FC<FacetChipProps> = ({
  label,
  facetName,
  excluded = false,
  onToggleExclude,
  onRemove,
  wrap = false,
  dataQa,
}) => {
  const { t } = useTranslation();
  const text = excluded ? t('not {{name}}', { name: label }) : label;
  const accessible = facetName ? `${facetName}: ${text}` : text;
  const toggleLabel = excluded ? t('Include') : t('Exclude');

  return (
    <S.Chip
      container
      $excluded={excluded}
      data-qa={dataQa}
      data-excluded={excluded ? 'true' : undefined}
    >
      <Typography
        noWrap={!wrap}
        sx={wrap ? { whiteSpace: 'normal', wordBreak: 'break-word' } : undefined}
        title={text}
        color={excluded ? 'texts.secondary' : undefined}
      >
        {text}
      </Typography>
      {onToggleExclude && (
        <AppTooltip
          title={toggleLabel}
          type='dark'
          checkForOverflow={false}
          childSx={{ display: 'flex', ml: 0.5 }}
        >
          <Button
            buttonType='linkGray-m'
            icon={excluded ? <AddIcon /> : <ExcludeIcon />}
            onClick={onToggleExclude}
            aria-label={`${toggleLabel}: ${accessible}`}
            data-qa='facet-chip-toggle'
          />
        </AppTooltip>
      )}
      {/* the × keeps the accessible name the rail's chips have always had — the chip's own statement ("Tag: not
          pii") — so a screen reader hears what is removed; the toggle above is the one prefixed with its verb */}
      <AppTooltip
        title={t('Remove')}
        type='dark'
        checkForOverflow={false}
        childSx={{ display: 'flex', ml: 0.5 }}
      >
        <Button
          buttonType='linkGray-m'
          icon={<ClearIcon />}
          onClick={onRemove}
          aria-label={accessible}
          data-qa='facet-chip-remove'
        />
      </AppTooltip>
    </S.Chip>
  );
};

export default FacetChip;
