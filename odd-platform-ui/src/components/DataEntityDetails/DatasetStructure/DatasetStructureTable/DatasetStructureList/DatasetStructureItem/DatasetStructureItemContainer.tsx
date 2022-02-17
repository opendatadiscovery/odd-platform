import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { DataSetField } from 'generated-sources';
import { isComplexField } from 'lib/helpers';
import { getDatasetStructure } from 'redux/selectors/datasetStructure.selectors';
import DatasetStructureItem from 'components/DataEntityDetails/DatasetStructure/DatasetStructureTable/DatasetStructureList/DatasetStructureItem/DatasetStructureItem';

const mapStateToProps = (
  state: RootState,
  {
    datasetField,
    dataEntityId,
    versionId,
  }: {
    datasetField: DataSetField;
    dataEntityId: number;
    versionId?: number;
  }
) => ({
  childFields: isComplexField(datasetField.type.type)
    ? getDatasetStructure(state, {
        datasetId: dataEntityId,
        versionId,
        parentField: datasetField.id,
      })
    : [],
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DatasetStructureItem);
