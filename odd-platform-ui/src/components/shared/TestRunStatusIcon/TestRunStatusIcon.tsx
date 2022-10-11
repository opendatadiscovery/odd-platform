import * as React from 'react';
import { DataEntityRunStatus } from 'generated-sources';
import * as S from './TestRunStatusIconStyles';

export interface TestRunStatusIconProps {
  typeName: DataEntityRunStatus;
}

const TestRunStatusIcon: React.FC<TestRunStatusIconProps> = ({ typeName }) => (
  <S.Content $typeName={typeName} />
);

export default TestRunStatusIcon;
