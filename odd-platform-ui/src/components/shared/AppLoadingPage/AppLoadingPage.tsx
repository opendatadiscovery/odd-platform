import React from 'react';
import AppCircularProgress from 'components/shared/AppCircularProgress/AppCircularProgress';
import { Container } from './AppLoadingPageStyles';

const AppLoadingPage: React.FC = () => (
  <Container container aria-label="AppLoadingPage">
    <AppCircularProgress
      size={70}
      background="transparent"
      progressBackground="dark"
    />
  </Container>
);

export default AppLoadingPage;
