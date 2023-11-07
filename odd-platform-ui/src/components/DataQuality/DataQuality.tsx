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
    return [
      {
        title: 'Healthy',
        value: 10,
        color: palette.runStatus.SUCCESS.color,
      },
      {
        title: 'Unhealthy',
        value: 5,
        color: palette.runStatus.FAILED.color,
      },
      {
        title: 'Unknown',
        value: 2,
        color: palette.runStatus.BROKEN.color,
      },
    ];
  }, [data?.testResults]);

  const tableMonitoredTables = useMemo(() => {
    if (!data) return [];
    return [
      {
        title: 'Monitored',
        value: 10,
        color: palette.runStatus.SUCCESS.color,
      },
      {
        title: 'Not Monitored',
        value: 5,
        color: palette.runStatus.UNKNOWN.color,
      },
    ];
  }, [data?.testResults]);

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
              width={300}
              height={300}
              innerRadius={66}
              outerRadius={90}
              label={t('Total Tables')}
              data={tableHealthData}
            />
          </S.ChartWrapper>
          <S.ChartWrapper>
            <Typography variant='title' component='h4' align='center'>
              {t('Test Results Breakdown')}
            </Typography>
            <DonutChart
              width={300}
              height={300}
              innerRadius={66}
              outerRadius={90}
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
        <S.ChartWrapper>
          <Typography variant='title' component='h4' align='center'>
            {t('Monitored Tables')}
          </Typography>
          <DonutChart
            width={300}
            height={300}
            innerRadius={66}
            outerRadius={90}
            label={t('Total Tables')}
            data={tableMonitoredTables}
          />
        </S.ChartWrapper>
      </S.Section>
    </S.Container>
  );
};

export default DataQuality;
