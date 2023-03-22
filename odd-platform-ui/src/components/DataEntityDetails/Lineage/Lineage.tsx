import React from 'react';
import { useAppSelector } from 'redux/lib/hooks';
import { getIsDataEntityBelongsToClass } from 'redux/selectors';
import { useAppParams } from 'lib/hooks';
import DEGLineage from './DEGLineage/DEGLineage';
import HierarchyLineage from './HierarchyLineage/HierarchyLineage';

const Lineage: React.FC = () => {
  const { dataEntityId } = useAppParams();
  const { isDEG } = useAppSelector(getIsDataEntityBelongsToClass(dataEntityId));

  // return isDEG ? <DEGLineage /> : <HierarchyLineage />;
  return <DEGLineage />;
  // return null;
};

export default Lineage;
