import React, { forwardRef, useMemo } from 'react';
import { PieChart, Pie, Cell, Text, Label } from 'recharts';
import type { LabelProps, type PieLabelRenderProps } from 'recharts';
import { typography } from 'theme/typography';
import type { PolarViewBox } from 'recharts/types/util/types';
import { palette } from 'theme/palette';

interface DonutChartData {
  title: string;
  value: number;
  color?: string;
}

interface DonutChartProps extends Omit<React.ComponentProps<typeof PieChart>, 'data'> {
  data: DonutChartData[];
  label?: string;
}
const RADIAN = Math.PI / 180;
const CustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  value,
  color,
}: PieLabelRenderProps) => {
  const radius =
    Number(outerRadius) +
    (Number(outerRadius) - Number(innerRadius)) * Math.abs(Math.cos(RADIAN));
  const x = Number(cx) + radius * Math.cos(-midAngle * RADIAN);
  const y = Number(cy) + radius * Math.sin(-midAngle * RADIAN);

  return (
    <Text
      display={value ? 'block' : 'none'}
      x={x}
      y={y}
      dy={10}
      textAnchor='middle'
      fontSize={typography.h1.fontSize}
      lineHeight={typography.h1.lineHeight}
      fontWeight={typography.h1.fontWeight}
      fill={color}
    >
      {value}
    </Text>
  );
};

const CustomPieLabel = ({ viewBox, value, label }: LabelProps & { label?: string }) => {
  const { cx, cy } = viewBox as PolarViewBox;
  return (
    <>
      <Text
        x={cx}
        y={Number(cy) - 12}
        fill={palette.texts.secondary}
        fontSize={typography.h4.fontSize}
        fontWeight={typography.h4.fontWeight}
        className='recharts-text recharts-label'
        textAnchor='middle'
        dominantBaseline='central'
      >
        {label}
      </Text>
      <Text
        x={cx}
        y={Number(cy) + 12}
        fill={palette.texts.primary}
        fontSize={typography.h0.fontSize}
        fontWeight={typography.h0.fontWeight}
        className='recharts-text recharts-label'
        textAnchor='middle'
        dominantBaseline='central'
      >
        {value}
      </Text>
    </>
  );
};

const DonutChart: React.FC<DonutChartProps> = props => {
  const { data, label, ...pieChartProps } = props;
  const { width, height, innerRadius, outerRadius } = pieChartProps;
  const totalValue = useMemo(
    () => data.reduce((acc, { value }) => acc + value, 0),
    [data]
  );

  return (
    <PieChart width={width} height={height}>
      <Pie
        label={CustomLabel}
        labelLine={false}
        data={data}
        dataKey='value'
        nameKey='title'
        cx='50%'
        cy='50%'
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={90}
        endAngle={-270}
      >
        <Label
          width={30}
          position='center'
          content={<CustomPieLabel value={totalValue} label={label} />}
        />
        {data.map(entry => (
          <Cell key={entry.title} fill={entry.color} />
        ))}
      </Pie>
    </PieChart>
  );
};

export default DonutChart;
