import React, { useMemo } from 'react';
import type { DataQualityCategoryResults } from 'generated-sources';
import { DataEntityRunStatus } from 'generated-sources';
import { Typography } from '@mui/material';
import { useGetDataQualityDashboard } from 'lib/hooks/api/dataQuality';
import { DonutChart } from 'components/shared/elements';
import { useTheme } from 'styled-components';
import { useTranslation } from 'react-i18next';
import * as S from './DataQuality.styles';

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

  return (
    <S.Container>
      <S.SectionWrapper>
        <S.DashboardLegend>
          {Object.values(DataEntityRunStatus).map(status => (
            <S.DashboardLegendItem key={status} $status={status}>
              <Typography variant='subtitle1'>
                {capitalizeFirstLetter(status.toLowerCase())}
              </Typography>
            </S.DashboardLegendItem>
          ))}
        </S.DashboardLegend>
        {isSuccess ? (
          <DonutChart
            width={300}
            height={300}
            innerRadius={66}
            outerRadius={90}
            label={t('Total Tests')}
            data={testResultsBreakdownChartData}
          />
        ) : null}
      </S.SectionWrapper>
      <S.SectionWrapper>Table Monitor Section</S.SectionWrapper>
    </S.Container>
  );
};

export default DataQuality;
