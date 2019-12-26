import React, { FC } from 'react';
import { Switch, Route, Router } from 'react-router-dom';
import styled from 'styled-components';

import AppError from './AppError';
import history from '../../Infrastructure/history';
import Logo from './Logo';
import Post from '../Post/Post';
import Link from '../../Components/Link';

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: #222;
  font-family: "Courier New", Courier, monospace;
  font-size: 16px;
  color: #f9f9f9;
  overflow-y: scroll;
  overflow-x: auto;
`;

const Content = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
`;

const StyledLogo = styled(Logo)`
  padding: 80px 0;
`;

const PostList = styled.ul`
  margin: 0;
  padding: 0;
  text-align: center;
  min-height: 500px;
`;

const PostItem = styled.li`
  list-style: none;
  padding: 0;
  margin: 0;
  line-height: 1.6em;
`;

const Footer = styled.footer`
  max-width: 500px;
  padding: 40px 0 0 0;
  margin: 80px auto 80px auto;
  border-top: 1px solid #666;
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
                <PostList>
                  <PostItem>
                    <Link to="/2019-12-25/how-to-host-a-asp-net-core-3-mvc-application-as-a-azure-function">
                      2019-12-25 - How to host a ASP .NET Core 3.0 MVC Application as a Azure Function
                    </Link>
                  </PostItem>
                </PostList>
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
