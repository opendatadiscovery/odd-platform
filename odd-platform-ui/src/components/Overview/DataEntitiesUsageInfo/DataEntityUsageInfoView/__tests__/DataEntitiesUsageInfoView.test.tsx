import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  getByRole,
  getByText,
  getByTextContent,
  queryByRole,
  render,
} from 'lib/tests/testHelpers';
import { dataEntityUsageInfoPayload } from 'lib/tests/mocks';
import DataEntitiesUsageInfoView, {
  type DataEntitiesUsageInfoViewProps,
} from '../DataEntitiesUsageInfoView';

const handleEntityClassClick = vi.fn();
const handleEntityClassTypeClick = vi.fn();

const setupComponent = (props: Partial<DataEntitiesUsageInfoViewProps> = {}) =>
  render(
    <DataEntitiesUsageInfoView
      totalCount={dataEntityUsageInfoPayload.totalCount}
      unfilledCount={dataEntityUsageInfoPayload.unfilledCount}
      classesUsageInfo={dataEntityUsageInfoPayload.dataEntityClassesInfo}
      handleEntityClassClick={handleEntityClassClick}
      handleEntityClassTypeClick={handleEntityClassTypeClick}
      {...props}
    />
  );

describe('DataEntitiesUsageInfoView', () => {
  it('render with mocked props', () => {
    setupComponent();
    expect(getByTextContent('Total entities: 1')).toBeTruthy();
    expect(getByText('5 unfilled entities')).toBeTruthy();
    expect(getByRole('list')).toBeVisible();
  });

  it('expect empty classes usage info array', () => {
    setupComponent({ classesUsageInfo: [] });
    expect(queryByRole('list')).toBeNull();
  });
});
