import React, { useMemo } from 'react';
import type { DataQualityCategoryResults } from 'generated-sources';
import { DataEntityRunStatus } from 'generated-sources';
import { Typography } from '@mui/material';
import { useGetDataQualityDashboard } from 'lib/hooks/api/dataQuality';
import { DonutChart } from 'components/shared/elements';
import { useTheme } from 'styled-components';
import { useTranslation } from 'react-i18next';
import * as S from './DataQuality.styles';
import TestCategoryResults from './TestResults/TestCategoryResults';

function capitalizeFirstLetter(str: string) {
  return [...str][0].toUpperCase() + str.slice(1);
}

const DONUT_CHART_WIDTH = 300;
const DONUT_CHART_HEIGHT = 300;
const DONUT_CHART_INNER_RADIUS = 66;
const DONUT_CHART_OUTER_RADIUS = 90;

function calcTestResultsBreakdown(categoryResults: DataQualityCategoryResults[]) {
  return categoryResults.reduce(
    ({ statusCounts, total }, { results }) => {
      results.forEach(({ status, count }) => {
        statusCounts.set(status, (statusCounts.get(status) ?? 0) + count);
        total += count;
      });
      return { statusCounts, total };
    },
    {
      statusCounts: new Map<DataEntityRunStatus, number>(),
      total: 0,
    }
  );
}

function createDonutChartData(category: string, value: number, color: string) {
  return { title: category, value, color };
}

const DataQuality: React.FC = () => {
  const { data, isSuccess } = useGetDataQualityDashboard();
  const { palette } = useTheme();
  const { t } = useTranslation();

  const testResultsBreakdownChartData = useMemo(() => {
    if (!data) return [];
    const breakdown = calcTestResultsBreakdown(data.testResults);
    return Array.from(breakdown.statusCounts.entries()).map(([status, count]) =>
      createDonutChartData(
        status,
        count,
        palette.runStatus[status].color ?? palette.dataQualityDashboard.unknown
      )
    );
  }, [data?.testResults, palette.runStatus]);

  const tableHealthData = useMemo(() => {
    if (!data) return [];
    const { healthyTables, warningTables, errorTables } =
      data.tablesDashboard.tablesHealth;
    const { healthy, warning, error } = palette.dataQualityDashboard;
    return [
      createDonutChartData('Healthy', healthyTables, healthy),
      createDonutChartData('Warning', warningTables, warning),
      createDonutChartData('Error', errorTables, error),
    ];
  }, [data?.tablesDashboard.tablesHealth, palette.dataQualityDashboard]);

  const tableMonitoredTables = useMemo(() => {
    if (!data) return [];
    const { monitoredTables, notMonitoredTables } = data.tablesDashboard.monitoredTables;
    const { monitored, nonMonitored } = palette.dataQualityDashboard;
    return [
      createDonutChartData('Monitored', monitoredTables, monitored),
      createDonutChartData('Not Monitored', notMonitoredTables, nonMonitored),
    ];
  }, [data?.tablesDashboard.monitoredTables, palette.dataQualityDashboard]);

  const testResults = useMemo(() => {
    if (!data) return [];
    return data.testResults.sort(({ category: a }, { category: b }) =>
      a.localeCompare(b)
    );
  }, [data?.testResults]);

  return (
    <S.Container>
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
            {isSuccess &&
              testResults.map(categoryResults => (
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
    </S.Container>
  );
};

export default DataQuality;
