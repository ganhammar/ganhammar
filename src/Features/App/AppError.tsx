import React, { Component } from 'react';
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
    margin: 0 0 30px 0;
    font-size: 30px;
`;

class AppError extends Component {
    state = {
        hasError: false
    };

    componentDidCatch() {
        this.setState({ hasError: true });
    }

    render() {
        const { children } = this.props;
        const { hasError } = this.state;

        if (!hasError) {
            return children;
        }

        return (
            <Wrapper>
                <Content>
██╗  ██╗ ██████╗ ██╗  ██╗<br />
██║  ██║██╔═████╗██║  ██║<br />
███████║██║██╔██║███████║<br />
╚════██║████╔╝██║╚════██║<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;██║╚██████╔╝&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;██║<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;╚═╝ ╚═════╝&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;╚═╝<br />
                </Content>
                <Link to="/" onClick={() => this.setState({ hasError: false })}>&lt;-- Back</Link>
            </Wrapper>
        );
    }
}

export default AppError;