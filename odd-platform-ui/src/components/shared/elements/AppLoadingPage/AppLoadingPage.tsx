import React, { type FC } from 'react';
import AppCircularProgress from 'components/shared/elements/AppCircularProgress/AppCircularProgress';
import { Container } from 'components/shared/elements/AppLoadingPage/AppLoadingPageStyles';

const AppLoadingPage: FC = () => (
  <Container container>
    <AppCircularProgress size={70} background='transparent' progressBackground='dark' />
  </Container>
);

export default AppLoadingPage;
