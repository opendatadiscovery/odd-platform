import React from 'react';
import type { Mock } from 'vitest';
import { describe, expect, it, vi } from 'vitest';
import { queryByRole, render } from 'lib/tests/testHelpers';
import { useDataEntitiesUsage } from 'lib/hooks/api';
import { dataEntityUsageInfoPayload } from 'lib/tests/mocks';
import DataEntitiesUsageInfo from '../DataEntitiesUsageInfo';

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
});
