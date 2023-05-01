import React from 'react';
import type { DataSetFieldTypeTypeEnum } from 'generated-sources';
import { isComplexField } from 'lib/helpers';
import type { DataSetStructureTypesCount } from 'redux/interfaces';
import TruncateMarkup from 'react-truncate-markup';
import { Button } from 'components/shared/elements';
import { Grid } from '@mui/material';
import DatasetStructureTypeCountLabel from './DatasetStructureTypeCountLabel/DatasetStructureTypeCountLabel';

interface DatasetStructureTypeCountsProps {
  fieldsCount: number;
  typesCount: DataSetStructureTypesCount;
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

const DatasetStructureTypeCounts: React.FC<DatasetStructureTypeCountsProps> = ({
  fieldsCount,
  typesCount,
  expanded,
  setExpanded,
}) => {
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

  const truncateButton = (
    showOrHide: boolean,
    listLength?: number,
    renderedListLength?: number
  ) => (
    <Button
      text={
        !showOrHide && listLength && renderedListLength
          ? `Show ${listLength - renderedListLength - 1} hidden`
          : 'Hide'
      }
      buttonType='tertiary-m'
      onClick={() => setExpanded(prev => !prev)}
    />
  );

  const ellipsis = React.useCallback(
    (label: React.ReactNode) => {
      if (label && typeof label === 'object' && 'props' in label) {
        const labelsRendered = label?.props?.children;

        return truncateButton(expanded, typesCountList.length, labelsRendered.length);
      }

      return undefined;
    },
    [expanded, typesCountList.length]
  );

  return !expanded ? (
    <TruncateMarkup lines={1} ellipsis={ellipsis}>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {typesCountList.map(getTruncateMarkupAtom)}
      </div>
    </TruncateMarkup>
  ) : (
    <Grid container rowGap={1}>
      {typesCountList.map(getTruncateMarkupAtom)}
      {truncateButton(expanded)}
    </Grid>
  );
};

export default DatasetStructureTypeCounts;
