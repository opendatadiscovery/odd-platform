import React from 'react';
import { Grid } from '@mui/material';
import { DataSetField } from 'generated-sources';
import { useAppSelector } from 'redux/lib/hooks';
import { getIsUniqStatsExist } from 'redux/selectors';
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
  const isUniqStatsExist = useAppSelector(
    getIsUniqStatsExist({
      datasetId: dataEntityId,
      versionId,
    })
  );

  return (
    <S.Container container>
      <S.TableHeader container>
        <S.TableCell item lg={8} flexBasis="54.5% !important">
          Column
        </S.TableCell>
        {isUniqStatsExist && (
          <>
            <S.TableCell item lg={1}>
              Unique
            </S.TableCell>
            <S.TableCell item lg={1}>
              Missing
            </S.TableCell>
            <S.TableCell item lg={4}>
              Stats
            </S.TableCell>
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
