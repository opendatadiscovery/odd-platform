import React, { useCallback, useMemo, useState } from 'react';
import type { DataQualityRunsApiGetDataQualityTestsRunsRequest } from 'generated-sources';
import { DataEntityRunStatus } from 'generated-sources';
import { Typography } from '@mui/material';
import { useGetDataQualityDashboard } from 'lib/hooks/api/dataQuality';
import { DonutChart } from 'components/shared/elements';
import { useTheme } from 'styled-components';
import { useTranslation } from 'react-i18next';
import * as Layout from 'components/shared/styled-components/layout';
import * as S from './DataQuality.styles';
import TestCategoryResults from './TestResults/TestCategoryResults';

function capitalizeFirstLetter(str: string) {
  return [...str][0].toUpperCase() + str.slice(1);
}

const DONUT_CHART_WIDTH = 300;
const DONUT_CHART_HEIGHT = 300;
const DONUT_CHART_INNER_RADIUS = 66;
const DONUT_CHART_OUTER_RADIUS = 90;

const DataQuality: React.FC = () => {
  const [filterParams, setFilterParams] =
    useState<DataQualityRunsApiGetDataQualityTestsRunsRequest>({});
  const { data, isSuccess } = useGetDataQualityDashboard(filterParams);
  const { palette } = useTheme();
  const { t } = useTranslation();

  const calcTestResultsBreakdown = useCallback(() => {
    const initBreakdown = {
      statusCounts: new Map<DataEntityRunStatus, number>(),
      total: 0,
    };
    if (!data) return initBreakdown;
    return data.testResults.reduce(({ statusCounts, total }, { results }) => {
      results.forEach(({ status, count }) => {
        statusCounts.set(status, (statusCounts.get(status) ?? 0) + count);
        total += count;
      });
      return { statusCounts, total };
    }, initBreakdown);
  }, [data?.testResults]);

  const testResultsBreakdownChartData = useMemo(() => {
    if (!data) return [];
    const breakdown = calcTestResultsBreakdown();
    return Array.from(breakdown.statusCounts).map(([status, count]) => {
      const color =
        palette.runStatus[status].color ?? palette.dataQualityDashboard.unknown;
      return { title: status, value: count, color };
    });
  }, [data]);

  const tableHealthData = useMemo(() => {
    if (!data) return [];
    const { healthyTables, warningTables, errorTables } =
      data.tablesDashboard.tablesHealth;
    const { healthy, warning, error } = palette.dataQualityDashboard;
    return [
      { title: 'Healthy', value: healthyTables, color: healthy },
      { title: 'Warning', value: warningTables, color: warning },
      { title: 'Error', value: errorTables, color: error },
    ];
  }, [data?.tablesDashboard.tablesHealth]);

  const tableMonitoredTables = useMemo(() => {
    if (!data) return [];
    const { monitoredTables, notMonitoredTables } = data.tablesDashboard.monitoredTables;
    const { monitored, nonMonitored } = palette.dataQualityDashboard;
    return [
      { title: 'Monitored', value: monitoredTables, color: monitored },
      { title: 'Non-Monitored', value: notMonitoredTables, color: nonMonitored },
    ];
  }, [data?.tablesDashboard.monitoredTables]);

  const testResults = isSuccess
    ? data.testResults.toSorted(({ category: a }, { category: b }) => a.localeCompare(b))
    : [];

  return (
    <Layout.LayoutContainer>
      <Layout.Sidebar $alignSelf='flex-start' $position='sticky'>
        filters here!
      </Layout.Sidebar>
      <Layout.Content>
        <S.Section>
          <S.DashboardLegend>
            {Object.values(DataEntityRunStatus).map(status => (
              <S.DashboardLegendItem key={status} $status={status}>
                <Typography variant='label'>
                  {capitalizeFirstLetter(status.toLowerCase())}
                </Typography>
              </S.DashboardLegendItem>
            ))}
          </S.DashboardLegend>
          <S.SubSection>
            <S.ChartWrapper>
              <DonutChart
                width={DONUT_CHART_WIDTH}
                height={DONUT_CHART_HEIGHT}
                innerRadius={DONUT_CHART_INNER_RADIUS}
                outerRadius={DONUT_CHART_OUTER_RADIUS}
                label={t('Total Tables')}
                title={t('Table Health')}
                data={tableHealthData}
              />
            </S.ChartWrapper>
            <S.ChartWrapper>
              <DonutChart
                width={DONUT_CHART_WIDTH}
                height={DONUT_CHART_HEIGHT}
                innerRadius={DONUT_CHART_INNER_RADIUS}
                outerRadius={DONUT_CHART_OUTER_RADIUS}
                label={t('Total Tests')}
                title={t('Test Results Breakdown')}
                data={testResultsBreakdownChartData}
              />
            </S.ChartWrapper>
            <S.SubSection $direction='column'>
              {testResults.map(categoryResults => (
                <TestCategoryResults
                  key={categoryResults.category}
                  categoryResults={categoryResults}
                />
              ))}
            </S.SubSection>
          </S.SubSection>
        </S.Section>
        <S.Section>
          <S.DashboardLegend>
            <S.DashboardLegendItem $status={DataEntityRunStatus.SUCCESS}>
              <Typography variant='label'>{t('Monitored')}</Typography>
            </S.DashboardLegendItem>
            <S.DashboardLegendItem $status={DataEntityRunStatus.UNKNOWN}>
              <Typography variant='label'>{t('Unmonitored')}</Typography>
            </S.DashboardLegendItem>
          </S.DashboardLegend>
          <S.ChartWrapper>
            <DonutChart
              width={DONUT_CHART_WIDTH}
              height={DONUT_CHART_HEIGHT}
              innerRadius={DONUT_CHART_INNER_RADIUS}
              outerRadius={DONUT_CHART_OUTER_RADIUS}
              label={t('Total Tables')}
              title={t('Monitored Tables')}
              data={tableMonitoredTables}
            />
          </S.ChartWrapper>
        </S.Section>
      </Layout.Content>
    </Layout.LayoutContainer>
  );
};

export default DataQuality;
