import React, { FC } from 'react';
import { Switch, Route, Router } from 'react-router-dom';
import styled from 'styled-components';

import AppError from './AppError';
import history from '../../Infrastructure/history';
import Logo from './Logo';
import PostList from '../Post/PostList';
import Post from '../Post/Post';

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: #222;
  font-family: "Courier New", Courier, monospace;
  color: #f9f9f9;
  overflow-y: scroll;
  overflow-x: auto;
  pre {
    font-family: "Courier New", Courier, monospace;
  }
`;

const Content = styled.div`
  max-width: 62.5rem;
  margin: 0 auto;
  padding: 0 1.25rem;
`;

const StyledLogo = styled(Logo)`
  padding: 5rem 0;
`;

const Footer = styled.footer`
  max-width: 31.25rem;
  padding: 2.5rem 0 0 0;
  margin: 5rem auto 5rem auto;
  border-top: 0.063rem solid #666;
  color: #666;
  text-align: center;
`;

const App: FC = () => {
  return (
    <Router history={history}>
      <Wrapper>
        <AppError>
          <Content>
            <StyledLogo />
            <Switch>
              <Route path="/:postId/*" component={Post} />
              <Route path="/" exact>
                <PostList />
              </Route>
            </Switch>
            <Footer>
              <p>Anton Ganhammar</p>
              <p>ganhammar[a]gmail.com</p>
            </Footer>
          </Content>
        </AppError>
      </Wrapper>
    </Router>
  );
}

export default App;
