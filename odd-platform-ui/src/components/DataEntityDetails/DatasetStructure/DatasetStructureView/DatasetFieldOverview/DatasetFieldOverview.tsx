import React from 'react';
import { useStructureContext } from 'components/DataEntityDetails/DatasetStructure/StructureContext/StructureContext';
import { useAppSelector } from 'redux/lib/hooks';
import { getDatasetFieldById } from 'redux/selectors';

interface DatasetFieldOverviewProps {
  id?: number;
}
const DatasetFieldOverview: React.FC<DatasetFieldOverviewProps> = ({ id }) => {
  const { selectedFieldId } = useStructureContext();

  const field = useAppSelector(getDatasetFieldById(selectedFieldId));

  return <div>{field?.name}</div>;
};

export default DatasetFieldOverview;
