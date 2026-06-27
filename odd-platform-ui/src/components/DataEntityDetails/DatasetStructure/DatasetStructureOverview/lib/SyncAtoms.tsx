import { type FC, useEffect } from 'react';
import { useSetAtom } from 'jotai';
import type { DataSetField, DataSetVersion } from 'generated-sources';
import type { DataSetStructureTypesCount } from 'redux/interfaces';
import {
  datasetStructureRootAtom,
  datasetFieldRowsCountAtom,
  datasetFieldTypesCountAtom,
  datasetFieldFieldsCountAtom,
  datasetVersionsAtom,
} from './atoms';

interface SyncAtomsProps {
  datasetStructureRoot: DataSetField[];
  datasetFieldRowsCount: number;
  datasetFieldTypesCount: DataSetStructureTypesCount;
  datasetFieldFieldsCount: number;
  datasetVersions: DataSetVersion[];
}

/**
 * Keep the SERVER-DATA atoms in step with the redux source after the initial hydration.
 *
 * `useHydrateAtoms` (HydrateAtoms) seeds these atoms ONCE, on mount. When the structure
 * changes afterwards — e.g. a tag added to a column updates `fieldById` in redux — the props
 * change but the atoms would stay frozen until a full remount/reload, so the tag-filter chips
 * (and the column list, both derived from `datasetStructureRootAtom`) showed stale data while
 * the per-column tag editor — which reads redux live — already reflected the change (#1679).
 * This re-syncs those atoms on change so the whole view stays consistent without a reload.
 *
 * The USER-INTERACTION atoms (search query, selected tag/type filters, selected field) are
 * deliberately NOT synced here, so an active filter / search / selection survives the refresh.
 */
const SyncAtoms: FC<SyncAtomsProps> = ({
  datasetStructureRoot,
  datasetFieldRowsCount,
  datasetFieldTypesCount,
  datasetFieldFieldsCount,
  datasetVersions,
}) => {
  const setRoot = useSetAtom(datasetStructureRootAtom);
  const setRowsCount = useSetAtom(datasetFieldRowsCountAtom);
  const setTypesCount = useSetAtom(datasetFieldTypesCountAtom);
  const setFieldsCount = useSetAtom(datasetFieldFieldsCountAtom);
  const setVersions = useSetAtom(datasetVersionsAtom);

  useEffect(() => {
    setRoot(datasetStructureRoot);
  }, [datasetStructureRoot, setRoot]);
  useEffect(() => {
    setRowsCount(datasetFieldRowsCount);
  }, [datasetFieldRowsCount, setRowsCount]);
  useEffect(() => {
    setTypesCount(datasetFieldTypesCount);
  }, [datasetFieldTypesCount, setTypesCount]);
  useEffect(() => {
    setFieldsCount(datasetFieldFieldsCount);
  }, [datasetFieldFieldsCount, setFieldsCount]);
  useEffect(() => {
    setVersions(datasetVersions);
  }, [datasetVersions, setVersions]);

  return null;
};

export default SyncAtoms;
