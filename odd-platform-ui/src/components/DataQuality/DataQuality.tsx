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

const DataQuality: React.FC = () => {
  const { data, isSuccess } = useGetDataQualityDashboard();
  const { palette } = useTheme();
  const { t } = useTranslation();

  const testResultsBreakdownChartData = useMemo(() => {
    if (!data) return [];
    const breakdown = calcTestResultsBreakdown(data.testResults);
    return Array.from(breakdown.statusCounts.entries()).map(([status, count]) => ({
      title: status,
      value: count,
      color: palette.runStatus[status].color,
    }));
  }, [data?.testResults]);

  const tableHealthData = useMemo(() => {
    if (!data) return [];
    const { healthyTables, warningTables, errorTables } =
      data.tablesDashboard.tablesHealth;
    return [
      {
        title: 'Healthy',
        value: healthyTables,
        color: palette.runStatus.SUCCESS.color,
      },
      {
        title: 'Warning',
        value: warningTables,
        color: palette.runStatus.BROKEN.color,
      },
      {
        title: 'Error',
        value: errorTables,
        color: palette.runStatus.FAILED.color,
      },
    ];
  }, [data?.tablesDashboard.monitoredTables]);

  const tableMonitoredTables = useMemo(() => {
    if (!data) return [];
    const { monitoredTables, notMonitoredTables } = data.tablesDashboard.monitoredTables;
    return [
      {
        title: 'Monitored',
        value: monitoredTables,
        color: palette.runStatus.SUCCESS.color,
      },
      {
        title: 'Not Monitored',
        value: notMonitoredTables,
        color: palette.runStatus.UNKNOWN.color,
      },
    ];
  }, [data?.tablesDashboard.monitoredTables]);

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
            <Typography variant='title' component='h4' align='center'>
              {t('Table Health')}
            </Typography>
            <DonutChart
              width={DONUT_CHART_WIDTH}
              height={DONUT_CHART_HEIGHT}
              innerRadius={DONUT_CHART_INNER_RADIUS}
              outerRadius={DONUT_CHART_OUTER_RADIUS}
              label={t('Total Tables')}
              data={tableHealthData}
            />
          </S.ChartWrapper>
          <S.ChartWrapper>
            <Typography variant='title' component='h4' align='center'>
              {t('Test Results Breakdown')}
            </Typography>
            <DonutChart
              width={DONUT_CHART_WIDTH}
              height={DONUT_CHART_HEIGHT}
              innerRadius={DONUT_CHART_INNER_RADIUS}
              outerRadius={DONUT_CHART_OUTER_RADIUS}
              label={t('Total Tests')}
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
          <Typography variant='title' component='h4' align='center'>
            {t('Monitored Tables')}
          </Typography>
          <DonutChart
            width={DONUT_CHART_WIDTH}
            height={DONUT_CHART_HEIGHT}
            innerRadius={DONUT_CHART_INNER_RADIUS}
            outerRadius={DONUT_CHART_OUTER_RADIUS}
            label={t('Total Tables')}
            data={tableMonitoredTables}
          />
        </S.ChartWrapper>
      </S.Section>
    </S.Container>
  );
};

export default DataQuality;
