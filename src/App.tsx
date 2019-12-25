import React, { FC } from 'react';
import { Switch, Route, Router } from 'react-router-dom';
import styled from 'styled-components';

import history from './Infrastructure/history';
import Logo from './Components/Logo';
import Post from './Components/Post';
import Link from './Components/Link';

const Wrapper = styled.div`
  width: 100%;
  min-height: 100%;
  font-family: "Courier New", Courier, monospace;
  background-color: #222;
  color: #f9f9f9;
`;

const Content = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const StyledLogo = styled(Logo)`
  padding: 80px 0;
`;

const PostList = styled.ul`
  margin: 0;
  padding: 0;
  text-align: center;
`;

const PostItem = styled.li`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const App: FC = () => {
  return (
    <Router history={history}>
      <Wrapper>
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
        </Content>
      </Wrapper>
    </Router>
  );
}

export default App;
