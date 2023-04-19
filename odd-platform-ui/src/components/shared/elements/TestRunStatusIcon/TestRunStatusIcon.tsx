import * as React from 'react';
import { type DataEntityRunStatus } from 'generated-sources';
import * as S from 'components/shared/elements/TestRunStatusIcon/TestRunStatusIconStyles';

export interface TestRunStatusIconProps {
  typeName: DataEntityRunStatus;
}

const TestRunStatusIcon: React.FC<TestRunStatusIconProps> = ({ typeName }) => (
  <S.Content $typeName={typeName} />
);

export default TestRunStatusIcon;
