import React from 'react';
import { Grid } from '@mui/material';
import { DataSetField } from 'generated-sources';
import DatasetStructureList from './DatasetStructureList/DatasetStructureList';
import * as S from './DatasetStructureTableStyles';

interface DatasetStructureTableProps {
  dataEntityId: number;
  versionId?: number;
  datasetStructureRoot: DataSetField[];
  scrollToIndex: number;
}

const DatasetStructureTable: React.FC<DatasetStructureTableProps> = ({
  dataEntityId,
  versionId,
  datasetStructureRoot,
  scrollToIndex,
}) => (
  <S.Container item xs={12} sx={{ mt: 2.5 }}>
    <S.TableHeader container>
      <Grid item xs={6} container>
        <S.ColContainer item $colType="name">
          Column
        </S.ColContainer>
      </Grid>
      <Grid item xs={2} container>
        <S.ColContainer item xs={6} $colType="uniq">
          Unique
        </S.ColContainer>
        <S.ColContainer item xs={6} $colType="missing">
          Missing
        </S.ColContainer>
      </Grid>
      <S.ColContainer item xs={4} $colType="stats">
        Stats
      </S.ColContainer>
    </S.TableHeader>
    <Grid item xs={12} container>
      <DatasetStructureList
        scrollToIndex={scrollToIndex}
        dataEntityId={dataEntityId}
        versionId={versionId}
        datasetStructureRoot={datasetStructureRoot}
        datasetRowsCount={datasetStructureRoot.length}
      />
    </Grid>
  </S.Container>
);
export default DatasetStructureTable;
