import React, { type FC } from 'react';
import { Grid } from '@mui/material';
import DatasetStructureHeader from './DatasetStructureHeader/DatasetStructureHeader';
import DatasetFieldOverview from './DatasetFieldOverview/DatasetFieldOverview';
import DatasetStructureList from './DatasetStructureList/DatasetStructureList';
import * as S from './DatasetStructureView.styles';

const DatasetStructureView: FC = () => (
  <Grid container>
    <DatasetStructureHeader />
    <S.Container>
      <S.Item>
        <DatasetStructureList />
      </S.Item>
      <S.Item>
        <DatasetFieldOverview />
      </S.Item>
    </S.Container>
  </Grid>
);

export default DatasetStructureView;
