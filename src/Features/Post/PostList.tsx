import React, { FC } from 'react';
import styled from 'styled-components';

import Link from '../../Components/Link';
import allPosts from '../../Posts/all-posts.json';

const List = styled.ul`
  margin: 0;
  padding: 0;
  text-align: center;
  min-height: 500px;
`;

const Item = styled.li`
  list-style: none;
  padding: 0;
  margin: 0 0 0.8em 0;
  line-height: 1.6em;
`;

const PostList: FC = () => {
  return (
    <List>
      {allPosts.map(({ date, url, title }) => (
        <Item key={date}>
          <Link to={`/${date}/${url}`}>
            {`${date} - ${title}`}
          </Link>
        </Item>
      ))}
    </List>
  )
};

export default PostList;