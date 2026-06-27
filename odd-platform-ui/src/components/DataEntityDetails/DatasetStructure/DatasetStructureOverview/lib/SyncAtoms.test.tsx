import React, { useEffect } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { DataSetFieldTypeTypeEnum, type DataSetField, type Tag } from 'generated-sources';
import DatasetStructureOverviewProvider from './DatasetStructureOverviewProvider';
import { aggregateFieldTags } from './filtering';
import { datasetStructureRootAtom, selectedTagIdsAtom } from './atoms';

/**
 * CTRIB-040 / odd-platform#1679 — the Structure-tab tag filter must reflect a column tag-add WITHOUT
 * a page reload.
 *
 * Root cause: DatasetStructureOverviewProvider hydrated datasetStructureRootAtom ONCE (useHydrateAtoms);
 * a tag added to a column updates redux (fieldById) but the atom — which backs the filter chips and the
 * column list — stayed a frozen snapshot until a full remount. SyncAtoms re-syncs the server-data atoms
 * on change. These tests render the Provider, then RE-RENDER it with an updated structure (the same React
 * tree -> the jotai store persists, exactly like redux pushing new data into the live page) and assert the
 * atom-derived tag set follows — RED without SyncAtoms (the atom stays frozen), GREEN with it.
 */

const tag = (id: number, name: string): Tag => ({ id, name });
const field = (id: number, name: string, tags: Tag[]): DataSetField => ({
  id,
  oddrn: `//dataset/field/${id}`,
  name,
  type: { type: DataSetFieldTypeTypeEnum.STRING, logicalType: 'varchar' } as DataSetField['type'],
  tags,
});

// Reads exactly what the header tag-filter chips derive: aggregateFieldTags over the live atom.
const AvailableTagsProbe: React.FC = () => {
  const root = useAtomValue(datasetStructureRootAtom);
  return (
    <div data-testid='available-tags'>
      {aggregateFieldTags(root)
        .map(t => t.name)
        .join(',')}
    </div>
  );
};

const renderProvider = (root: DataSetField[], children: React.ReactNode) =>
  render(
    <DatasetStructureOverviewProvider
      datasetStructureRoot={root}
      initialSelectedFieldId={root[0]?.id ?? 0}
      datasetFieldRowsCount={0}
      datasetFieldTypesCount={{}}
      datasetFieldFieldsCount={root.length}
      datasetVersions={[]}
    >
      {children}
    </DatasetStructureOverviewProvider>
  );

describe('SyncAtoms — Structure-view server-data stays fresh without a remount (#1679)', () => {
  it('re-syncs the available tag set when a column gains a tag (no reload)', () => {
    const before = [field(1, 'email', [tag(1, 'PII')])];
    // same field id 1, a tag added — exactly what `updateDataSetFieldTags.fulfilled` does to fieldById.
    const after = [field(1, 'email', [tag(1, 'PII'), tag(2, 'gdpr')])];

    const { rerender } = renderProvider(before, <AvailableTagsProbe />);
    const probe = () => screen.getByTestId('available-tags');
    // Before the tag-add the filter set is exactly {PII}.
    expect(probe()).toHaveTextContent('PII');
    expect(probe()).not.toHaveTextContent('gdpr');

    rerender(
      <DatasetStructureOverviewProvider
        datasetStructureRoot={after}
        initialSelectedFieldId={1}
        datasetFieldRowsCount={0}
        datasetFieldTypesCount={{}}
        datasetFieldFieldsCount={after.length}
        datasetVersions={[]}
      >
        <AvailableTagsProbe />
      </DatasetStructureOverviewProvider>
    );

    // After the in-page tag-add the filter set must include the NEW tag WITHOUT a reload
    // (presence, not order — aggregateFieldTags sorts by importance/count/name).
    // RED without SyncAtoms: the once-hydrated atom stays frozen at {PII} -> 'gdpr' never appears.
    expect(probe()).toHaveTextContent('PII');
    expect(probe()).toHaveTextContent('gdpr');
  });

  it('does NOT clobber an active tag filter when the structure re-syncs', () => {
    const before = [field(1, 'email', [tag(1, 'PII')])];
    const after = [field(1, 'email', [tag(1, 'PII'), tag(2, 'gdpr')])];

    const FilterProbe: React.FC = () => {
      const selected = useAtomValue(selectedTagIdsAtom);
      const setSelected = useSetAtom(selectedTagIdsAtom);
      useEffect(() => {
        setSelected([1]); // the user clicked the PII chip
      }, [setSelected]);
      return <div data-testid='selected'>{selected.join(',')}</div>;
    };

    const { rerender } = renderProvider(before, <FilterProbe />);
    expect(screen.getByTestId('selected')).toHaveTextContent('1');

    rerender(
      <DatasetStructureOverviewProvider
        datasetStructureRoot={after}
        initialSelectedFieldId={1}
        datasetFieldRowsCount={0}
        datasetFieldTypesCount={{}}
        datasetFieldFieldsCount={after.length}
        datasetVersions={[]}
      >
        <FilterProbe />
      </DatasetStructureOverviewProvider>
    );

    // SyncAtoms only re-syncs server-data atoms — the user's active filter must survive.
    expect(screen.getByTestId('selected')).toHaveTextContent('1');
  });
});
