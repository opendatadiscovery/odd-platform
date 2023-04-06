import React, { type FC } from 'react';
import { useAppParams, useQueryParams } from 'lib/hooks';
import { useAppSelector } from 'redux/lib/hooks';
import { getDatasetVersions } from 'redux/selectors';
import { useDatasetStructureCompare } from 'lib/hooks/api';
import { AppErrorPage, AppLoadingPage, EmptyContentPlaceholder } from 'components/shared';
import type { ErrorState } from 'redux/interfaces';
import DatasetStructureCompareList from './DatasetStructureCompareList/DatasetStructureCompareList';
import type { StructureCompareQueryParams } from './lib/interfaces';
import DatasetStructureCompareHeader from './DatasetStructureCompareHeader/DatasetStructureCompareHeader';
import { defaultStructureCompareQuery } from './lib/constants';

const DatasetStructureCompare: FC = () => {
  const { dataEntityId } = useAppParams();

  const {
    queryParams: { firstVersionId, secondVersionId },
  } = useQueryParams<StructureCompareQueryParams>(defaultStructureCompareQuery);

  const datasetVersions = useAppSelector(getDatasetVersions(dataEntityId));

  const { data, isLoading, isError, error, isSuccess } = useDatasetStructureCompare({
    dataEntityId,
    firstVersionId: +firstVersionId,
    secondVersionId: +secondVersionId,
  });

  return (
    <>
      <DatasetStructureCompareHeader datasetVersions={datasetVersions} />
      {isSuccess && data?.fieldList.length > 0 && (
        <DatasetStructureCompareList compareList={data?.fieldList} />
      )}
      {isLoading && <AppLoadingPage />}
      <AppErrorPage showError={isError} offsetTop={210} error={error as ErrorState} />
      <EmptyContentPlaceholder
        isContentLoaded={isSuccess}
        isContentEmpty={!data?.fieldList.length}
        offsetTop={210}
      />
    </>
  );
};

export default DatasetStructureCompare;
