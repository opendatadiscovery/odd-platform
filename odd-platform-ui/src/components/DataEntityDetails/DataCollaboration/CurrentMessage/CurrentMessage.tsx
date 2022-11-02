import React from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import { useAppParams, useAppPaths } from 'lib/hooks';
import { useAppDispatch } from 'redux/lib/hooks';
import { AppLoadingPage } from 'components/shared';
import * as S from './CurrentMessageStyles';

const NoMessage = React.lazy(() => import('./NoMessage/NoMessage'));
const MessageForm = React.lazy(() => import('./MessageForm/MessageForm'));
const Thread = React.lazy(() => import('./NoMessage/NoMessage'));

const CurrentMessage: React.FC = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { dataEntityId } = useAppParams();
  const { datasetStructurePath } = useAppPaths();

  return (
    <S.Container container>
      <React.Suspense fallback={<AppLoadingPage />}>
        <Switch>
          <Route
            exact
            path={['/dataentities/:dataEntityId/collaboration']}
            component={NoMessage}
          />
          <Route
            exact
            path={['/dataentities/:dataEntityId/collaboration/createMessage']}
            render={() => <MessageForm dataEntityId={dataEntityId} />}
          />
          <Route
            exact
            path={['/dataentities/:dataEntityId/collaboration/:messageId']}
            render={() => <div>message</div>}
          />
        </Switch>
      </React.Suspense>
    </S.Container>
  );
};
export default CurrentMessage;
