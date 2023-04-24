import React, { type FC } from 'react';
import { useAppParams, useQueryParams } from 'lib/hooks';
import { useAppSelector } from 'redux/lib/hooks';
import { getDatasetVersions } from 'redux/selectors';
import { useDatasetStructureCompare } from 'lib/hooks/api';
import {
  AppErrorPage,
  AppLoadingPage,
  EmptyContentPlaceholder,
} from 'components/shared/elements';
import type { ErrorState } from 'redux/interfaces';
import { useAtom } from 'jotai';
import { showOnlyChangesAtom } from './lib/atoms';
import DatasetStructureCompareList from './DatasetStructureCompareList/DatasetStructureCompareList';
import type { StructureCompareQueryParams } from './lib/interfaces';
import DatasetStructureCompareHeader from './DatasetStructureCompareHeader/DatasetStructureCompareHeader';
import { defaultStructureCompareQuery } from './lib/constants';

const DatasetStructureCompare: FC = () => {
  const { dataEntityId } = useAppParams();
  const [showChangesOnly] = useAtom(showOnlyChangesAtom);

  const {
    queryParams: { firstVersionId, secondVersionId },
  } = useQueryParams<StructureCompareQueryParams>(defaultStructureCompareQuery);

  const datasetVersions = useAppSelector(getDatasetVersions(dataEntityId));

  const { data, isLoading, isError, error, isSuccess } = useDatasetStructureCompare({
    dataEntityId,
    firstVersionId: +firstVersionId,
    secondVersionId: +secondVersionId,
    showChangesOnly,
  });

  return (
    <>
      <DatasetStructureCompareHeader datasetVersions={datasetVersions} />
      {isSuccess && data?.structureDiffList.length > 0 && (
        <DatasetStructureCompareList
          compareList={data?.structureDiffList}
          isNested={data?.isNested}
        />
      )}
      {isLoading && <AppLoadingPage />}
      <AppErrorPage showError={isError} offsetTop={210} error={error as ErrorState} />
      <EmptyContentPlaceholder
        isContentLoaded={isSuccess}
        isContentEmpty={!data?.structureDiffList.length}
        offsetTop={210}
      />
    </>
  );
};

export default DatasetStructureCompare;
