import * as React from 'react';
import { DataQualityTestRunStatus } from 'generated-sources';
import * as S from './TestRunStatusIconStyles';

export interface TestRunStatusIconProps {
  typeName: DataQualityTestRunStatus;
}

const TestRunStatusIcon: React.FC<TestRunStatusIconProps> = ({
  typeName,
}) => <S.Content $typeName={typeName} />;

export default TestRunStatusIcon;
