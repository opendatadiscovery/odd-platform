import { atom } from 'jotai';
import type {
  DataSetField,
  DataSetFieldTypeTypeEnum,
  DataSetVersion,
} from 'generated-sources';
import type { DataSetStructureTypesCount } from 'redux/interfaces';

export const selectedFieldIdAtom = atom(0);
export const isSearchUpdatedAtom = atom(false);
export const searchQueryAtom = atom('');
export const datasetStructureRootAtom = atom<DataSetField[]>([]);
// In-page column filters (client-side over the already-loaded structure — #1679).
export const selectedTagIdsAtom = atom<number[]>([]);
export const selectedFieldTypesAtom = atom<DataSetFieldTypeTypeEnum[]>([]);
export const datasetVersionsAtom = atom<DataSetVersion[]>([]);
export const datasetFieldRowsCountAtom = atom(0);
export const datasetFieldFieldsCountAtom = atom(0);
export const datasetFieldTypesCountAtom = atom<DataSetStructureTypesCount>({});
