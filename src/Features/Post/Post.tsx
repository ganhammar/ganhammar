import React, { FC, useState } from 'react';
import marked from 'marked';
import hljs from 'highlight.js';
import styled from 'styled-components';

import useRouter from '../../Hooks/useRouter';
import Link from '../../Components/Link';
import Commento from './Commento';

marked.setOptions({
    highlight: (code, lang) => hljs.highlight(lang, code).value,
});

const Wrapper = styled.section`
    h1 {
        margin: 0;
    }
    p {
        margin: 24px 0;
    }
    article {
        margin: 40px 0;
        word-wrap: break-word;
        a {
            color: #f9f9f9;
            &:hover {
                text-decoration: none;
            }
        }
        pre {
            background-color: #333;
            padding: 16px;
            border: 1px solid #111;
            font-size: 14px;
            overflow: auto;
        }
        code {
            font-family: "Courier New", Courier, monospace;
            font-size: 16px;
            line-height: 1.4em;
        }
    }
    .commento-root {
        * {
            color: #f9f9f9;
        }
        textarea {
            background-color: #333;
            border: 1px solid #111;
        }
        .commento-logged-container .commento-logged-in-as .commento-name {
            color: #bbb;
        }
        .commento-card .commento-name {
            color: #888;
        }
    }
`;

const StyledLink = styled(Link)`
    color: #888;
    border-bottom-color: #888;
`;

const StyledCommento = styled(Commento)`
    margin-top: 40px;
`;

const Loading = styled.div`
    margin: 80px 0;
    text-align: center;
`;

const Post: FC = () => {
    const { match: { params: { postId } } } = useRouter();
    const [content, setContent] = useState<string>();
    const postPath = require(`../../Posts/${postId}.md`);

    fetch(postPath)
        .then(response => response.text())
        .then(text => setContent(marked(text)));

    return (
        <Wrapper>
            <StyledLink to="/">&lt;-- Back</StyledLink>
            {!content && <Loading>Loading...</Loading>}
            {content && (<article dangerouslySetInnerHTML={{ __html: content }}></article>)}
            <StyledLink to="/">&lt;-- Back</StyledLink>
            <StyledCommento id={postId} />
        </Wrapper>
    );
};

export default Post;