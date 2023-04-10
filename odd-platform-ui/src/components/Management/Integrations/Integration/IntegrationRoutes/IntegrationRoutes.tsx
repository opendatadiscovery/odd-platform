import React, { type FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppSuspenseWrapper } from 'components/shared';
import { useAppPaths } from 'lib/hooks';
import type { Integration } from 'generated-sources';

const IntegrationOverview = React.lazy(
  () => import('../IntegrationOverview/IntegrationOverview')
);
const IntegrationConfigure = React.lazy(
  () => import('../IntegrationConfigure/IntegrationConfigure')
);

interface IntegrationRoutesProps {
  textBlocks: Integration['textBlocks'];
  codeSnippets: Integration['codeSnippets'];
}

const IntegrationRoutes: FC<IntegrationRoutesProps> = ({ textBlocks, codeSnippets }) => {
  const { ManagementRoutes } = useAppPaths();

  return (
    <AppSuspenseWrapper>
      <Routes>
        <Route
          path={ManagementRoutes.overview}
          element={<IntegrationOverview textBlocks={textBlocks} />}
        />
        <Route
          path={ManagementRoutes.configure}
          element={<IntegrationConfigure codeSnippets={codeSnippets} />}
        />
        <Route path='/' element={<Navigate to={ManagementRoutes.overview} replace />} />
      </Routes>
    </AppSuspenseWrapper>
  );
};

export default IntegrationRoutes;
