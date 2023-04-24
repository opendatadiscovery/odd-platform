import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppCircularProgress } from 'components/shared/elements';
import { useAppPaths } from 'lib/hooks';
import * as S from './CurrentMessageStyles';

const NoMessage = React.lazy(() => import('./NoMessage/NoMessage'));
const Thread = React.lazy(() => import('./Thread/Thread'));

interface CurrentMessageProps {
  messageDate: string;
}

const CurrentMessage: React.FC<CurrentMessageProps> = ({ messageDate }) => {
  const { DataEntityRoutes } = useAppPaths();

  return (
    <S.Container container id='thread-messages-list'>
      <React.Suspense
        fallback={<AppCircularProgress size={40} background='transparent' />}
      >
        <Routes>
          <Route path='' element={<NoMessage />} />
          <Route
            path={DataEntityRoutes.messageIdParam}
            element={<Thread messageDate={messageDate} />}
          />
        </Routes>
      </React.Suspense>
    </S.Container>
  );
};
export default CurrentMessage;
