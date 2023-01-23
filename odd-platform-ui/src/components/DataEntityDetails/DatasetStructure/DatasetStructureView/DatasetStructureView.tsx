import React from 'react';
import { Grid } from '@mui/material';
import type { DataSetField, DataSetStats } from 'generated-sources';
import { useAppSelector } from 'redux/lib/hooks';
import { getIsUniqStatsExist } from 'redux/selectors';
import DatasetStructureList from './DatasetStructureList/DatasetStructureList';
import * as S from './DatasetStructureViewStyles';

interface DatasetStructureViewProps {
  dataEntityId: number;
  versionId?: number;
  indexToScroll: number;
  datasetStructureRoot: DataSetField[];
  datasetRowsCount: DataSetStats['rowsCount'];
}

const DatasetStructureView: React.FC<DatasetStructureViewProps> = ({
  dataEntityId,
  versionId,
  indexToScroll,
  datasetStructureRoot,
  datasetRowsCount,
}) => {
  const isUniqStatsExist = useAppSelector(
    getIsUniqStatsExist({ datasetId: dataEntityId, versionId })
  );

  return (
    <S.Container container>
      <S.TableHeader container>
        <S.TableCell item lg={5.98}>
          Column
        </S.TableCell>
        {isUniqStatsExist && (
          <>
            <S.TableCell item lg={0.76}>
              Unique
            </S.TableCell>
            <S.TableCell item lg={0.75}>
              Missing
            </S.TableCell>
            <S.TableCell item lg={4.51}>
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
          datasetRowsCount={datasetRowsCount}
        />
      </Grid>
    </S.Container>
  );
};
export default DatasetStructureView;
