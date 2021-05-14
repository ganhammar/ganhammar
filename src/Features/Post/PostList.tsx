import React, { FC, useState, useEffect } from 'react';
import styled from 'styled-components';

import Link from '../../Components/Link';
import Loading from '../../Components/Loading';

const List = styled.ul`
  margin: 0;
  padding: 0;
  text-align: center;
  min-height: 31.25rem;
`;

const Item = styled.li`
  list-style: none;
  padding: 0;
  margin: 0 0 0.8em 0;
  line-height: 1.6em;
`;

interface Post {
  date: string,
  title: string,
  url: string,
};

const PostList: FC = () => {
  const [xml, setXml] = useState<string>('');
  const [posts, setPosts] = useState<Array<Post>>();

  useEffect(() => {
    const fromSession = sessionStorage.getItem('posts');

    if (!fromSession) {
      fetch(`${process.env.REACT_APP_BLOB_CONTAINER_URL as string}?restype=container&comp=list&include=metadata`)
        .then(response => response.text())
        .then(result =>
        {
          sessionStorage.setItem('posts', result);
          setXml(result);
        });
    } else {
      setXml(fromSession);
    }
  }, []);
  
  
  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const blobs = doc.getElementsByTagName('Blob');
    const parsedPosts : Array<Post> = [];

    for (let i = blobs.length - 1; i >= 0; i--)
    {
      const blob = blobs[i];
      parsedPosts.push({
        date: (blob.getElementsByTagName('Name')[0].textContent as string).replace('.md', ''),
        title: blob.getElementsByTagName('Metadata')[0].getElementsByTagName('title')[0].textContent as string,
        url: blob.getElementsByTagName('Metadata')[0].getElementsByTagName('url')[0].textContent as string,
      });
    }

    setPosts(parsedPosts);
  }, [xml]);
  
  return (
    <List>
      {posts && posts.map(({ date, url, title }) => (
        <Item key={date}>
          <Link to={`/${date}/${url}`}>
            {`${date} - ${title}`}
          </Link>
        </Item>
      ))}
      {!posts && <Loading />}
    </List>
  )
};

export default PostList;