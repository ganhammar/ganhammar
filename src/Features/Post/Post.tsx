import React, { FC, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import marked from 'marked';
import hljs from 'highlight.js';
import styled from 'styled-components';

import Link from '../../Components/Link';
import Loading from '../../Components/Loading';

marked.setOptions({
    highlight: (code, lang) => hljs.highlight(lang, code).value,
});

const Wrapper = styled.section`
    h1 {
        margin: 0;
    }
    p {
        margin: 2rem 0;
    }
    article {
        margin: 2.5rem 0;
        word-wrap: break-word;
        a {
            color: #f9f9f9;
            &:hover {
                text-decoration: none;
            }
        }
        pre {
            background-color: #333;
            padding: 1rem;
            border: 0.063rem solid #111;
            overflow: auto;
        }
        code {
            font-family: "Courier New", Courier, monospace;
        }
    }
`;

const StyledLink = styled(Link)`
    color: #888;
    border-bottom-color: #888;
`;

interface ParamTypes {
    postId: string,
};

const Post: FC = () => {
    const { postId } = useParams<ParamTypes>();
    const [content, setContent] = useState<string>();
    const postPath = `${process.env.REACT_APP_BLOB_CONTAINER_URL as string}/${postId}.md`;

    useEffect(() => {
        const fromSession = sessionStorage.getItem(postId);

        if (!fromSession) {
            fetch(postPath)
                .then(response => response.text())
                .then(text =>
                {
                    sessionStorage.setItem(postId, text);
                    setContent(marked(text));
                });
        } else {
            setContent(marked(fromSession));
        }
    }, [postId, postPath]);

    return (
        <Wrapper>
            <StyledLink to="/">&lt;-- Back</StyledLink>
            {!content && <Loading />}
            {content && (<article dangerouslySetInnerHTML={{ __html: content }}></article>)}
            <StyledLink to="/">&lt;-- Back</StyledLink>
        </Wrapper>
    );
};

export default Post;