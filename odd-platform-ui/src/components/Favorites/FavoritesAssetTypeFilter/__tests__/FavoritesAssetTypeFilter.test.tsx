import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { AssetKind } from 'generated-sources';
import muiTheme from 'theme/mui.theme';
import { render, clickByText } from 'lib/tests/testHelpers';
import FavoritesAssetTypeFilter from '../FavoritesAssetTypeFilter';

/**
 * The Favorites asset-type facet (#1815 / PRD-0002 A1; ADR D8 — multi-select, default *All*). The
 * load-bearing behaviour is that the selected kinds show as removable chips and "Clear All" empties
 * the selection, matching the platform's catalog facets rather than the S3 bespoke checkbox group.
 *
 * The Clear All control is an emotion-styled custom Button that reads the app's MUI palette, so the
 * render is wrapped in the MUI ThemeProvider in addition to the shared harness's providers.
 */
const renderFacet = (
  selectedKinds: AssetKind[],
  onChange: (kinds: AssetKind[]) => void
) =>
  render(
    <ThemeProvider theme={muiTheme}>
      <FavoritesAssetTypeFilter selectedKinds={selectedKinds} onChange={onChange} />
    </ThemeProvider>
  );

describe('FavoritesAssetTypeFilter', () => {
  it('shows a chip for each selected kind', () => {
    renderFacet([AssetKind.TERM], vi.fn());
    expect(screen.getByText('Terms')).toBeTruthy();
  });

  it('does not render Clear All when nothing is selected', () => {
    renderFacet([], vi.fn());
    expect(screen.queryByText('Clear All')).toBeNull();
  });

  it('Clear All empties the selection', async () => {
    const onChange = vi.fn();
    renderFacet([AssetKind.TERM, AssetKind.DATA_ENTITY], onChange);
    await clickByText('Clear All');
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
