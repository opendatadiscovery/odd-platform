import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { getByRole, getByTextContent, render } from 'lib/tests/testHelpers';
import { dataEntityUsageInfoPayload } from 'lib/tests/mocks';
import { waitFor } from '@testing-library/react';
import DataEntitiesUsageInfoCard, {
  type DataEntityUsageInfoCardProps,
} from '../DataEntitiesUsageInfoCard';

const handleEntityClassClick = vi.fn();
const handleEntityClassTypeClick = vi.fn();

describe('DataEntitiesUsageInfoCard', () => {
  const setupComponent = (props: Partial<DataEntityUsageInfoCardProps> = {}) =>
    render(
      <DataEntitiesUsageInfoCard
        entityClass={dataEntityUsageInfoPayload.dataEntityClassesInfo[0].entityClass}
        dataEntityTypesInfo={
          dataEntityUsageInfoPayload.dataEntityClassesInfo[0].dataEntityTypesInfo
        }
        classTotalCount={dataEntityUsageInfoPayload.dataEntityClassesInfo[0].totalCount}
        handleEntityClassClick={handleEntityClassClick}
        handleEntityClassTypeClick={handleEntityClassTypeClick}
        classesCount={6}
        {...props}
      />
    );

  it('render', () => {
    setupComponent();
    expect(getByTextContent('Datasets200')).toBeTruthy();
    expect(getByTextContent('Dag300')).toBeTruthy();
  });

  it('open search when clicked on class', async () => {
    setupComponent({ dataEntityTypesInfo: [] });

    const classButton = getByRole('button');
    await classButton.click();

    await waitFor(() => expect(handleEntityClassClick).toHaveBeenCalledTimes(1));
  });
});
