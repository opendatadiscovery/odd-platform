import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { AssetKind } from 'generated-sources';
import { render, clickByRole } from 'lib/tests/testHelpers';
import type { RootState } from 'redux/interfaces';
import FavoriteStar from '../FavoriteStar';

/**
 * FavoriteStar (odd-platform#1815, CTRIB-039 S3): a self-hydrating, optimistic star. State legibility
 * is `aria-pressed` (not colour-alone), and a click flips the UI immediately (then the slice confirms).
 */

const { favoriteApiMock } = vi.hoisted(() => ({
  favoriteApiMock: {
    addFavorite: vi.fn().mockResolvedValue(undefined),
    removeFavorite: vi.fn().mockResolvedValue(undefined),
    getFavoriteStatus: vi.fn().mockResolvedValue([]),
  },
}));
vi.mock('lib/api', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, favoriteApi: favoriteApiMock };
});
vi.mock('lib/errorHandling', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, showSuccessToast: vi.fn(), showServerErrorToast: vi.fn() };
});

const withFavorites = (favoritedByKey: Record<string, boolean>): Partial<RootState> => ({
  favorites: {
    favoritedByKey,
    list: [],
    pageInfo: { total: 0, page: 0, hasNext: false },
  },
});

describe('FavoriteStar', () => {
  it('renders pressed when the asset is favorited', () => {
    render(<FavoriteStar assetKind={AssetKind.DATA_ENTITY} assetId={1} />, {
      preloadedState: withFavorites({ 'DATA_ENTITY:1': true }),
    });
    expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('true');
  });

  it('renders unpressed when the asset is not favorited', () => {
    render(<FavoriteStar assetKind={AssetKind.DATA_ENTITY} assetId={1} />, {
      preloadedState: withFavorites({ 'DATA_ENTITY:1': false }),
    });
    expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('false');
  });

  it('optimistically flips to pressed and calls addFavorite on click', async () => {
    render(<FavoriteStar assetKind={AssetKind.DATA_ENTITY} assetId={1} />, {
      preloadedState: withFavorites({ 'DATA_ENTITY:1': false }),
    });
    await clickByRole('button');
    expect(favoriteApiMock.addFavorite).toHaveBeenCalledWith({
      assetKind: AssetKind.DATA_ENTITY,
      assetId: 1,
    });
    expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('true');
  });
});
