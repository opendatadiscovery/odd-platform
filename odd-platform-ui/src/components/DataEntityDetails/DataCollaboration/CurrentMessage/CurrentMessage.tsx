import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { useAppParams } from 'lib/hooks';
import { AppCircularProgress } from 'components/shared';
import * as S from './CurrentMessageStyles';

const NoMessage = React.lazy(() => import('./NoMessage/NoMessage'));
const MessageForm = React.lazy(() => import('./MessageForm/MessageForm'));
const Thread = React.lazy(() => import('./Thread/Thread'));

interface CurrentMessageProps {
  messageDate: string;
}

const CurrentMessage: React.FC<CurrentMessageProps> = ({ messageDate }) => {
  const { dataEntityId } = useAppParams();

  return (
    <S.Container container>
      <React.Suspense
        fallback={<AppCircularProgress size={40} background='transparent' />}
      >
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
            render={() => <Thread messageDate={messageDate} />}
          />
        </Switch>
      </React.Suspense>
    </S.Container>
  );
};
export default CurrentMessage;
