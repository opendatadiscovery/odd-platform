import React from 'react';
import type { Mock } from 'vitest';
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen } from '@testing-library/react';
import type * as ReactRouterDom from 'react-router-dom';
import { queryByRole, render } from 'lib/tests/testHelpers';
import { useDataEntitiesUsage } from 'lib/hooks/api';
import { dataEntityUsageInfoPayload } from 'lib/tests/mocks';
import DataEntitiesUsageInfo from '../DataEntitiesUsageInfo';

const { navigateSpy } = vi.hoisted(() => ({ navigateSpy: vi.fn() }));
vi.mock('react-router-dom', async importOriginal => ({
  ...(await importOriginal<typeof ReactRouterDom>()),
  useNavigate: () => navigateSpy,
}));
vi.mock('lib/hooks/api', () => ({ useDataEntitiesUsage: vi.fn() }));

const setupComponent = () => render(<DataEntitiesUsageInfo />);

describe('DataEntitiesUsageInfo', () => {
  it('if data equals undefined', () => {
    (useDataEntitiesUsage as Mock).mockImplementation(() => ({ data: undefined }));
    setupComponent();
    expect(queryByRole('heading')).toBeNull();
    expect(queryByRole('list')).toBeNull();
  });

  it('if data fetching error', () => {
    (useDataEntitiesUsage as Mock).mockImplementation(() => ({ isError: true }));
    setupComponent();
    expect(queryByRole('heading')).toBeNull();
    expect(queryByRole('list')).toBeNull();
  });

  it('if data loaded', () => {
    (useDataEntitiesUsage as Mock).mockImplementation(() => ({
      data: dataEntityUsageInfoPayload,
    }));
    const comp = setupComponent();
    expect(comp.container.children.length).toEqual(1);
  });

  // #1835 ST-1c — a usage tile must open the param-URL search (where facet filtering works), NOT a legacy
  // /search/{sessionId}. RED on ref:main: the click dispatched createDataEntitiesSearch and only navigated
  // (asynchronously) to a session URL, so navigate is never called with the param URL. GREEN on the fix.
  it('a class tile navigates to /search?entityClasses[]=<id> (the working param flow)', async () => {
    navigateSpy.mockClear();
    (useDataEntitiesUsage as Mock).mockImplementation(() => ({
      data: dataEntityUsageInfoPayload,
    }));
    setupComponent();

    await act(async () => {
      await fireEvent.click(screen.getByRole('button', { name: 'Datasets' }));
    });

    expect(navigateSpy).toHaveBeenCalledWith('/search?entityClasses[]=1');
  });

  it('a class-type tile navigates to /search?entityClasses[]=<id>&types[]=<id>', async () => {
    navigateSpy.mockClear();
    (useDataEntitiesUsage as Mock).mockImplementation(() => ({
      data: dataEntityUsageInfoPayload,
    }));
    setupComponent();

    // the card renders exactly two role="button" nodes: [0] the class header ("Datasets"), [1] the type tile
    const buttons = screen.getAllByRole('button');
    await act(async () => {
      await fireEvent.click(buttons[1]);
    });

    expect(navigateSpy).toHaveBeenCalledWith('/search?entityClasses[]=1&types[]=1');
  });
});
