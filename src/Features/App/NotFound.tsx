import React, { FC } from 'react';
import styled from 'styled-components';

import Link from '../../Components/Link';

const Wrapper = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
`;

const Content = styled.pre`
    margin: 0 0 2rem 0;
    font-size: 2rem;
`;

type NotFoundProps = {
    onBackClick?: Function,
};

const NotFound: FC<NotFoundProps> = ({ onBackClick }) => (
    <Wrapper>
        <Content>
██╗  ██╗ ██████╗ ██╗  ██╗<br />
██║  ██║██╔═████╗██║  ██║<br />
███████║██║██╔██║███████║<br />
╚════██║████╔╝██║╚════██║<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;██║╚██████╔╝&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;██║<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;╚═╝ ╚═════╝&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;╚═╝<br />
        </Content>
        <Link to="/" onClick={() => onBackClick && onBackClick()}>&lt;-- Back</Link>
    </Wrapper>
);

export default NotFound;