import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Button } from 'components/shared/elements';

export type FacetMatchModeValue = 'any' | 'all';

export interface FacetMatchModeProps {
  /** a space-free id for the DOM hooks: `filter-<filterId>-match-<mode>` */
  filterId: string;
  value: FacetMatchModeValue;
  onChange: (mode: FacetMatchModeValue) => void;
}

/**
 * ST-11 (#1845) — the per-facet `Match any | Match all` control (ADR unified-asset-search D13). Rendered under a
 * multi-valued facet (Tag, Owner, Groups, Data entity type) once two or more values are selected — the only moment
 * the question exists — and never on a single-valued facet, where "all of two values" is always empty.
 *
 * Two plain text buttons rather than a switch or a radio: the platform has no segmented control, `AppSwitch` reads
 * as on/off (there is no "off" here) and `AppRadio` is a form idiom; the pair reads as the two words the URL and the
 * saved search use (`match_all[]`). The active word is the primary link colour, the inactive one grey.
 */
const FacetMatchMode: React.FC<FacetMatchModeProps> = ({ filterId, value, onChange }) => {
  const { t } = useTranslation();
  return (
    <Grid
      container
      alignItems='center'
      wrap='nowrap'
      sx={{ mt: 0.5, mx: 0.25 }}
      role='group'
      aria-label={t('Match')}
      data-qa={`filter-${filterId}-match`}
    >
      <Typography variant='subtitle2' color='texts.info' sx={{ mr: 0.5 }}>
        {t('Match')}
      </Typography>
      <Button
        text={t('any')}
        buttonType={value === 'any' ? 'link-m' : 'linkGray-m'}
        onClick={() => onChange('any')}
        aria-pressed={value === 'any'}
        data-qa={`filter-${filterId}-match-any`}
      />
      <Typography variant='subtitle2' color='texts.hint' sx={{ mx: 0.5 }}>
        |
      </Typography>
      <Button
        text={t('all')}
        buttonType={value === 'all' ? 'link-m' : 'linkGray-m'}
        onClick={() => onChange('all')}
        aria-pressed={value === 'all'}
        data-qa={`filter-${filterId}-match-all`}
      />
    </Grid>
  );
};

export default FacetMatchMode;
