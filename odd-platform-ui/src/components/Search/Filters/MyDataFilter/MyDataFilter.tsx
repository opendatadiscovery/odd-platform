import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { searchPath } from 'routes';
import {
  MY_DATA_DEFAULT_DEPTH,
  MY_DATA_DEPTH_OPTIONS,
  MY_DATA_SCOPES,
  type MyDataScope,
  paramsToSearchState,
  searchStateToParams,
} from 'lib/search/searchUrlState';
import { useAppSelector } from 'redux/lib/hooks';
import { getIdentity, getOwnership } from 'redux/selectors';
import { useAppInfo } from 'lib/hooks/api';
import AppSelect from 'components/shared/elements/AppSelect/AppSelect';
import AppMenuItem from 'components/shared/elements/AppMenuItem/AppMenuItem';
import FixedOptionsMultiFilter, {
  type FixedFilterOption,
} from '../FilterItem/FixedOptionsMultiFilter/FixedOptionsMultiFilter';

/**
 * ST-8 (#1842) — the **My data** scope filter: the assets you own, and the assets immediately up- or
 * downstream of them (ADR unified-asset-search D4/D8). It replaces the retired My-Objects result tab.
 *
 * The three scopes are additive and UNIONed, so ticking none is the "All" state — the same semantics (and the
 * same control) as the Asset-type filter beside it, rather than a second multiselect idiom in one sidebar.
 * Each lineage direction carries its own depth (1..3, default 1), shown only when that direction is selected.
 *
 * **Posture when the filter cannot personalise** — never a silent empty (the IT-055 / IT-056 defect class):
 * under `auth.type=DISABLED` there is no user-owner identity at all, so the whole group is HIDDEN, matching
 * what the manual already documents for the Recommended panel — the twin surface. For a signed-in user with no
 * Owner association the capability exists and the user has a remedy, so the group RENDERS DISABLED and names
 * it. (`whoami` cannot tell those two apart — under DISABLED it returns a dummy identity with no owner, the
 * same shape as an unbound user — which is why the auth mode is read from `/api/info`, as the Favorites panel
 * already does.)
 *
 * Selection rides the URL-only `?my_data=` param, written through the canonical serialiser so the URL stays
 * byte-identical to the `Search.tsx` mirror (which must merge these params back — the #1858 bug class).
 */
const MyDataFilter: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: appInfo } = useAppInfo();
  const identity = useAppSelector(getIdentity);
  const ownership = useAppSelector(getOwnership);

  const isAuthDisabled = appInfo?.authType === 'DISABLED';
  const isOwnerBound = Boolean(identity && ownership);

  const urlState = React.useMemo(
    () => paramsToSearchState(location.search),
    [location.search]
  );
  const selectedScopes = urlState.myData ?? [];

  const scopeLabels: Record<MyDataScope, string> = React.useMemo(
    () => ({
      MY_OBJECTS: t('My Objects'),
      UPSTREAM: t('Upstream of my data'),
      DOWNSTREAM: t('Downstream of my data'),
    }),
    [t]
  );

  const options: FixedFilterOption[] = React.useMemo(
    () => MY_DATA_SCOPES.map(scope => ({ id: scope, name: scopeLabels[scope] })),
    [scopeLabels]
  );

  const write = React.useCallback(
    (next: Partial<typeof urlState>) => {
      const params = searchStateToParams({ ...urlState, ...next });
      navigate(`${searchPath()}${params ? `?${params}` : ''}`);
    },
    [urlState, navigate]
  );

  const writeScopes = React.useCallback(
    (scopes: MyDataScope[]) => write({ myData: scopes.length ? scopes : undefined }),
    [write]
  );

  // Under DISABLED nobody on this deployment can ever use the filter, so it is clutter with no remedy.
  if (isAuthDisabled) {
    return null;
  }

  // Signed in but not bound to an Owner: the capability exists and the fix is one page away — hiding the
  // control would hide the fix, so it renders disabled and says why.
  if (!isOwnerBound) {
    return (
      <Grid container sx={{ mt: 2 }}>
        <Typography variant='h5' color='texts.hint'>
          {t('My data')}
        </Typography>
        <Typography variant='subtitle2' color='texts.info' sx={{ mt: 0.5 }}>
          {t(
            'Link your user to an Owner on the main page to filter by the assets you own.'
          )}
        </Typography>
      </Grid>
    );
  }

  return (
    <Grid container>
      <FixedOptionsMultiFilter
        name={t('My data')}
        filterId='my_data'
        options={options}
        selectedIds={selectedScopes}
        onSelect={option => writeScopes([...selectedScopes, option.id as MyDataScope])}
        onRemove={option =>
          writeScopes(selectedScopes.filter(scope => scope !== option.id))
        }
      />
      {selectedScopes.includes('UPSTREAM') && (
        <DepthSelect
          id='my-data-upstream-depth'
          label={t('Upstream depth')}
          value={urlState.upstreamDepth ?? MY_DATA_DEFAULT_DEPTH}
          onChange={depth => write({ upstreamDepth: depth })}
        />
      )}
      {selectedScopes.includes('DOWNSTREAM') && (
        <DepthSelect
          id='my-data-downstream-depth'
          label={t('Downstream depth')}
          value={urlState.downstreamDepth ?? MY_DATA_DEFAULT_DEPTH}
          onChange={depth => write({ downstreamDepth: depth })}
        />
      )}
      {selectedScopes.length > 0 && (
        <Typography variant='subtitle2' color='texts.info' sx={{ mt: 0.5 }}>
          {t('Query examples have no owner, so they are excluded from My data.')}
        </Typography>
      )}
    </Grid>
  );
};

interface DepthSelectProps {
  id: string;
  label: string;
  value: number;
  onChange: (depth: number) => void;
}

/**
 * A direction's lineage depth. Deliberately a fixed 1..3 select rather than a free number input: the ceiling
 * is a performance guarantee (a lineage walk is bounded by depth), so it is not something a user can type past.
 */
const DepthSelect: React.FC<DepthSelectProps> = ({ id, label, value, onChange }) => (
  <Grid container alignItems='center' wrap='nowrap' sx={{ mt: 1 }}>
    <Typography variant='body2' sx={{ mr: 1, whiteSpace: 'nowrap' }}>
      {label}
    </Typography>
    <AppSelect id={id} dataQAId={id} fullWidth={false} value={value} sx={{ minWidth: 72 }}>
      {MY_DATA_DEPTH_OPTIONS.map(depth => (
        <AppMenuItem key={depth} value={depth} onClick={() => onChange(depth)}>
          {depth}
        </AppMenuItem>
      ))}
    </AppSelect>
  </Grid>
);

export default MyDataFilter;
