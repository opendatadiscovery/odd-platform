import React, { type FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppSuspenseWrapper } from 'components/shared/elements';
import type { Integration } from 'lib/interfaces';
import IntegrationContent from '../IntegrationContent/IntegrationContent';

interface IntegrationRoutesProps {
  contentByTitle: Integration['contentByTitle'];
}

const IntegrationRoutes: FC<IntegrationRoutesProps> = ({ contentByTitle }) => {
  const firstPath = Object.keys(contentByTitle)[0];

  return (
    <AppSuspenseWrapper>
      <Routes>
        {Object.entries(contentByTitle).map(([title, integrationContent]) => (
          <Route
            key={title}
            path={title}
            element={<IntegrationContent integrationContent={integrationContent} />}
          />
        ))}
        <Route path='/' element={<Navigate to={firstPath} replace />} />
      </Routes>
    </AppSuspenseWrapper>
  );
};

export default IntegrationRoutes;
