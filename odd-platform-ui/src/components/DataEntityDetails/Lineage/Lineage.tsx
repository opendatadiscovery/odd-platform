import React from 'react';
import { useAppSelector } from 'redux/lib/hooks';
import {
  getDataEntityDetailsFetchingStatuses,
  getIsDataEntityBelongsToClass,
} from 'redux/selectors';
import { useDataEntityRouteParams } from 'routes';
import DEGLineageAtomProvider from './DEGLineage/lib/DEGLineageAtomProvider';
import DEGLineage from './DEGLineage/DEGLineage';
import HierarchyLineage from './HierarchyLineage/HierarchyLineage';

const Lineage: React.FC = () => {
  const { dataEntityId } = useDataEntityRouteParams();
  const { isDEG } = useAppSelector(getIsDataEntityBelongsToClass(dataEntityId));
  const { isLoaded } = useAppSelector(getDataEntityDetailsFetchingStatuses);

  if (!isLoaded) return null;

  return isDEG ? (
    <DEGLineageAtomProvider>
      <DEGLineage />
    </DEGLineageAtomProvider>
  ) : (
    <HierarchyLineage />
  );
};

export default Lineage;
