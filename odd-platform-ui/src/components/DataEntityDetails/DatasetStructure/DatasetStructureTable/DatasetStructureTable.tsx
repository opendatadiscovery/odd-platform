import React from 'react';
import { Grid } from '@mui/material';
import { DataSetField } from 'generated-sources';
import { useAppSelector } from 'lib/redux/hooks';
import { getStatsNull } from 'redux/selectors/datasetStructure.selectors';
import DatasetStructureList from './DatasetStructureList/DatasetStructureList';
import * as S from './DatasetStructureTableStyles';

interface DatasetStructureTableProps {
  dataEntityId: number;
  versionId?: number;
  indexToScroll: number;
  datasetStructureRoot: DataSetField[];
}

const DatasetStructureTable: React.FC<DatasetStructureTableProps> = ({
  dataEntityId,
  versionId,
  indexToScroll,
  datasetStructureRoot,
}) => {
  const isStatsNull = useAppSelector(
    getStatsNull({
      datasetId: dataEntityId,
      versionId,
    })
  );

  return (
    <S.Container item xs={12} sx={{ mt: 2.5 }}>
      <S.TableHeader container>
        <Grid item xs={isStatsNull ? 6 : 12} container>
          <S.ColContainer item $colType="name">
            Column
          </S.ColContainer>
        </Grid>
        {isStatsNull && (
          <>
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
          </>
        )}
      </S.TableHeader>
      <Grid item xs={12} container>
        <DatasetStructureList
          dataEntityId={dataEntityId}
          versionId={versionId}
          datasetStructureRoot={datasetStructureRoot}
          datasetRowsCount={datasetStructureRoot.length}
          indexToScroll={indexToScroll}
        />
      </Grid>
    </S.Container>
  );
};
export default DatasetStructureTable;
