import React, { useCallback } from 'react';
import { DataSetFieldTypeTypeEnum } from 'generated-sources';
import { isComplexField } from 'lib/helpers';
import { DataSetStructureTypesCount } from 'redux/interfaces';
import TruncateMarkup from 'react-truncate-markup';
import { AppButton } from 'components/shared';
import { Grid } from '@mui/material';
import DatasetStructureTypeCountLabel from './DatasetStructureTypeCountLabel/DatasetStructureTypeCountLabel';

interface DatasetStructureTypeCountLabelListProps {
  fieldsCount: number;
  typesCount: DataSetStructureTypesCount;
  onListOpening: (flag: boolean) => void;
}

const DatasetStructureTypeCountLabelList: React.FC<
  DatasetStructureTypeCountLabelListProps
> = ({ fieldsCount, typesCount, onListOpening }) => {
  const [viewAll, setViewAll] = React.useState(false);
  const typesCountList = Object.entries(typesCount);

  const getTruncateMarkupAtom = ([type, count]: [string, number]) =>
    isComplexField(type as DataSetFieldTypeTypeEnum) ? null : (
      <TruncateMarkup.Atom key={type}>
        <DatasetStructureTypeCountLabel
          sx={{ mx: 0.5 }}
          typeName={type as DataSetFieldTypeTypeEnum}
          count={count}
          fieldsCount={fieldsCount}
        />
      </TruncateMarkup.Atom>
    );

  const truncateButton = useCallback(
    (
      showOrHide: boolean,
      listLength?: number,
      renderedListLength?: number
    ) => (
      <AppButton
        size="medium"
        color="tertiary"
        onClick={() => {
          setViewAll(!showOrHide);
          onListOpening(!showOrHide);
        }}
      >
        {!showOrHide && listLength && renderedListLength
          ? `Show ${listLength - renderedListLength - 1} hidden`
          : 'Hide'}
      </AppButton>
    ),
    []
  );

  const ellipsis = (label: React.ReactPortal) => {
    const labelsRendered = label.props.children;

    return truncateButton(
      viewAll,
      typesCountList.length,
      labelsRendered.length
    );
  };

  return !viewAll ? (
    <TruncateMarkup lines={1} ellipsis={ellipsis}>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {typesCountList.map(getTruncateMarkupAtom)}
      </div>
    </TruncateMarkup>
  ) : (
    <Grid container rowGap={1}>
      {typesCountList.map(getTruncateMarkupAtom)}
      {truncateButton(viewAll)}
    </Grid>
  );
};
export default DatasetStructureTypeCountLabelList;
