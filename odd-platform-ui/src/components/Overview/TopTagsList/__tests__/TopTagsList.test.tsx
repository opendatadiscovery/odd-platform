import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import type * as ReactRouterDom from 'react-router-dom';
import { render, clickByText } from 'lib/tests/testHelpers';
import type { Tag } from 'generated-sources';
import TopTagsList from '../TopTagsList';

/**
 * #1835 ST-1c — a home Top-Tags chip must start a search on the working param-URL flow (`/search?tags[]=<id>`),
 * NOT create a legacy `/search/{sessionId}` where facet filtering is dead. RED on ref:main: the tag click
 * dispatched `createDataEntitiesSearch` and only navigated (asynchronously) to a session URL, so `navigate` is
 * never called with the param URL. GREEN on the fix: it navigates synchronously to the param URL.
 */
const { navigateSpy } = vi.hoisted(() => ({ navigateSpy: vi.fn() }));
vi.mock('react-router-dom', async importOriginal => ({
  ...(await importOriginal<typeof ReactRouterDom>()),
  useNavigate: () => navigateSpy,
}));

const tags = [
  { id: 5, name: 'sales', important: false, usedCount: 3 },
] as unknown as Tag[];

describe('TopTagsList — a home tag opens the param-URL search (#1835 ST-1c)', () => {
  it('navigates to /search?tags[]=<id> (the working param flow), not a session URL', async () => {
    navigateSpy.mockClear();
    render(<TopTagsList tags={tags} />);

    await clickByText('sales');

    expect(navigateSpy).toHaveBeenCalledWith('/search?tags[]=5');
  });
});
