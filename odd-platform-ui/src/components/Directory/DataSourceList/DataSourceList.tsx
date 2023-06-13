import React, { type FC, useMemo } from 'react';
import { useAppParams, useGetDirectoryDataSources } from 'lib/hooks';
import { Typography } from '@mui/material';
import {
  AppErrorPage,
  AppLoadingPage,
  DatasourceLogo,
  getCapitalizedDatasourceNameFromPrefix,
  ScrollableContainer,
} from 'components/shared/elements';
import { pluralize } from 'lib/helpers';
import type { ErrorState } from 'redux/interfaces';
import type { DataSourceDirectory } from 'generated-sources';
import startCase from 'lodash/startCase';
import uniq from 'lodash/uniq';
import keys from 'lodash/keys';
import flatten from 'lodash/flatten';
import omit from 'lodash/omit';
import DirectoryBreadCrumbs from '../DirectoryBreadCrumbs/DirectoryBreadCrumbs';
import * as S from '../shared/styles';
import type { Cell, FlexCell, Row } from './DataSourceTable/interfaces';
import * as Table from './DataSourceTable/Table';

const DataSourceList: FC = () => {
  const { dataSourceTypePrefix: prefix } = useAppParams();
  const {
    data: dataSourceList,
    isLoading,
    isError,
    error,
  } = useGetDirectoryDataSources({ prefix });

  const dataSourceTypeName = getCapitalizedDatasourceNameFromPrefix(prefix);

  const transformToHeaderCells = (data: DataSourceDirectory[]): Cell[] => {
    const keysToOmit: Array<keyof DataSourceDirectory> = [
      'id',
      'properties',
      'entitiesCount',
    ];
    const entitiesCount: keyof DataSourceDirectory = 'entitiesCount';

    const fieldNames = uniq(
      flatten(
        data.map(item => [
          ...keys(omit(item, keysToOmit)),
          ...keys(item.properties || {}),
          entitiesCount,
        ])
      )
    );

    return fieldNames.map(fieldName => ({
      fieldName,
      content: startCase(fieldName),
    }));
  };

  const addFlexToCell = (cells: Cell[]): FlexCell[] => {
    const { length } = cells;
    const fullBasis = 100;
    const setFlex = (basis: number) => `0 0 ${basis}%`;

    const countBasis = 10;
    const restBasis = fullBasis - countBasis;
    return cells.map(cell => {
      if (cell.fieldName === 'entitiesCount') {
        return { ...cell, flex: setFlex(countBasis) };
      }

      return { ...cell, flex: setFlex(restBasis / (length - 1)) };
    });
  };

  const headerCells = useMemo(() => {
    if (!dataSourceList?.items) return [];

    return transformToHeaderCells(dataSourceList.items);
  }, [dataSourceList?.items]);

  const flexedHeaderCells = useMemo(() => addFlexToCell(headerCells), [headerCells]);

  const createRows = (data: DataSourceDirectory[], cells: FlexCell[]): Row[] =>
    data.map(item => {
      const cellsForItem = cells.map(({ fieldName, flex }) => {
        let content = '';
        if (fieldName in item) {
          content = String(item[fieldName as keyof DataSourceDirectory]);
        } else if ('properties' in item && fieldName in item.properties) {
          content = String(item.properties[fieldName]);
        }
        return { content, flex };
      });

      return { id: item.id, cells: cellsForItem };
    });

  const rows = useMemo(() => {
    if (!dataSourceList?.items) return [];

    return createRows(dataSourceList.items, flexedHeaderCells);
  }, [dataSourceList?.items, flexedHeaderCells]);

  return (
    <>
      {isLoading && <AppLoadingPage />}
      <AppErrorPage showError={isError} offsetTop={210} error={error as ErrorState} />
      {dataSourceList && (
        <S.Container>
          <DirectoryBreadCrumbs />
          <S.Header>
            <S.LogoContainer>
              <DatasourceLogo name={prefix} rounded width={32} padding={1} />
              <Typography variant='h0' ml={1}>
                {dataSourceTypeName}
              </Typography>
            </S.LogoContainer>
            <Typography variant='body1' color='texts.hint'>
              {pluralize(dataSourceList.entitiesCount, 'entity', 'entities')}
            </Typography>
          </S.Header>
          <Table.Header cells={flexedHeaderCells} sx={{ mt: 1 }} />
          <ScrollableContainer>
            {rows.map(row => (
              <Table.Row key={row.id} row={row} />
            ))}
          </ScrollableContainer>
        </S.Container>
      )}
    </>
  );
};

export default DataSourceList;
