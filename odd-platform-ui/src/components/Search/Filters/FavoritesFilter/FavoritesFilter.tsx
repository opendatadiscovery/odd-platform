import React from 'react';
import { FormControlLabel, Grid } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppInfo } from 'lib/hooks/api';
import { buildSearchLink } from 'lib/hooks';
import { paramsToSearchState } from 'lib/search/searchUrlState';
import { AppTooltip, Checkbox } from 'components/shared/elements';
import { InformationIcon } from 'components/shared/icons';

/**
 * ST-7 (#1841) — the **Favorites** scope filter: narrows the cross-kind results to the assets the caller has
 * starred. It replaces the retired top-level `/favorites` tab, so this control is the only in-app way to see
 * "everything I starred" and therefore renders UNCONDITIONALLY in the Filters rail — never behind an
 * "add a filter" affordance.
 *
 * Shipped as a single on/off toggle rather than the All / Yes / No tri-state the issue proposed: a person
 * stars tens of assets out of thousands, so "everything I have NOT starred" returns a list indistinguishable
 * from "All" — a selected state that reads as broken, sitting between the user and the value they want. The
 * wire contract stays an optional boolean, so `favorites=false` is still expressible via the API and a
 * hand-written URL; only the dead on-screen option is gone.
 *
 * The selection rides the URL-only `?favorites=yes` param (like `sort` / `asset_kinds`) and is written
 * through the canonical serialiser so a control-written URL is byte-identical to a mirror-written one —
 * anything hand-built diverges and `Search.tsx`'s equality guard immediately rewrites it. Cleared by the
 * single Filters-panel "Clear All".
 *
 * Under `auth.type=DISABLED` there is no principal, so favorites are one instance-wide bucket: the label says
 * so (the same `(shared)` convention the Catalog Overview panel uses), and the inline-help icon carries the
 * CONSEQUENCE — the very sentence the retired tab displayed as a banner, so nothing is lost in the move.
 */
const FavoritesFilter: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: appInfo } = useAppInfo();
  const isShared = appInfo?.authType === 'DISABLED';

  const scope = React.useMemo(
    () => paramsToSearchState(location.search).favorites,
    [location.search]
  );
  const isOn = scope === 'yes';
  // `?favorites=no` (the inverted scope) is expressible by URL and API but has NO representation in a
  // two-state toggle. Rendering it as merely UNCHECKED would be a lie: the list IS narrowed — to everything
  // the caller has NOT starred — while the control claims no filter is applied. That is the FE-contradicts-BE
  // class (PLT-176). Show it as INDETERMINATE instead: honest about "a favorites scope is active that this
  // control cannot express", and a click escapes it.
  const isInverted = scope === 'no';

  const handleToggle = React.useCallback(() => {
    // Re-read the LIVE URL rather than closing over parsed state: the whole search state is preserved and
    // only this dimension changes, exactly as AssetTypeFilter does. Derived from `scope`, not from the
    // event's `checked`, because an indeterminate box reports `checked=true` on click — so from EITHER
    // active state a click clears the scope, and the inverted state is always escapable.
    const next = {
      ...paramsToSearchState(location.search),
      favorites: scope ? undefined : ('yes' as const),
    };
    navigate(buildSearchLink(next));
  }, [location.search, navigate, scope]);

  return (
    <Grid container alignItems='center' flexWrap='nowrap' sx={{ mt: 2 }}>
      <FormControlLabel
        sx={{ ml: -0.25, mr: 0.5 }}
        checked={isOn}
        onChange={handleToggle}
        control={<Checkbox sx={{ mr: 1 }} indeterminate={isInverted} />}
        label={isShared ? t('Favorites (shared) only') : t('Favorites only')}
        data-qa='filter-favorites'
      />
      {isShared && (
        <AppTooltip
          checkForOverflow={false}
          title={t(
            "Authentication is disabled, so favorites are shared by everyone on this instance. Don't use disabled auth in production."
          )}
        >
          {/* The hook lives on a plain span, not on InformationIcon: MUI's styled SvgIcon does not forward
              unknown DOM props, so a data-qa placed on the icon never reaches the rendered markup — and both
              the vitest case and IT-148 select on it. */}
          <span data-qa='filter-favorites-info' style={{ display: 'inline-flex' }}>
            <InformationIcon width={14} height={14} />
          </span>
        </AppTooltip>
      )}
    </Grid>
  );
};

export default FavoritesFilter;
