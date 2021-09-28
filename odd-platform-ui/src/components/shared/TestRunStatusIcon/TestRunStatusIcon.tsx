import * as React from 'react';
import { DataQualityTestRunStatusEnum } from 'generated-sources';
import * as S from './TestRunStatusIconStyles';

export interface TestRunStatusIconProps {
  typeName: DataQualityTestRunStatusEnum;
}

const TestRunStatusIcon: React.FC<TestRunStatusIconProps> = ({
  typeName,
}) => <S.Content typeName={typeName} />;

export default TestRunStatusIcon;
