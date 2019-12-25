import React, { FC, useState } from 'react';
import useRouter from '../Hooks/useRouter';
import marked from 'marked';
import hljs from 'highlight.js';
import styled from 'styled-components';

import Link from './Link';

marked.setOptions({
    highlight: (code, lang) => hljs.highlight(lang, code).value,
});

const Wrapper = styled.section`
    padding: 0 0 80px 0;
    h1 {
        margin: 32px 0 0 0;
    }
    p {
        margin: 24px 0;
    }
    pre {
        background-color: #333;
        padding: 16px;
        border: 1px solid #111;
        font-size: 14px;
    }
    code {
        font-size: 14px;
    }
    a {
        color: #f9f9f9;
        &:hover {
            text-decoration: none;
        }
    }
`;

const Post: FC = () => {
    const { match: { params: { postId } } } = useRouter();
    const [content, setContent] = useState<string>();
    const postPath = require(`../Posts/${postId}.md`);

    fetch(postPath)
        .then(response => response.text())
        .then(text => setContent(marked(text)));

    return (
        <Wrapper>
            <Link to="/">&lt;-- Back</Link>
            {!content && <article>Loading...</article>}
            {content && (<article dangerouslySetInnerHTML={{ __html: content }}></article>)}
            <Link to="/">&lt;-- Back</Link>
        </Wrapper>
    );
};

export default Post;