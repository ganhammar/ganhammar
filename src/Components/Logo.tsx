import React, { FC } from 'react';
import styled from 'styled-components';

const Header = styled.pre`
  text-align: center;
  margin: 0;
`;

type LogoProps = {
    className?: string,
};

const Logo: FC<LogoProps> = ({ className }) => (
    <Header className={className}>
        &nbsp;██████╗  █████╗ ███╗   ██╗██╗  ██╗ █████╗ ███╗   ███╗███╗   ███╗ █████╗ ██████╗ <br />
        ██╔════╝ ██╔══██╗████╗  ██║██║  ██║██╔══██╗████╗ ████║████╗ ████║██╔══██╗██╔══██╗<br />
        ██║  ███╗███████║██╔██╗ ██║███████║███████║██╔████╔██║██╔████╔██║███████║██████╔╝<br />
        ██║   ██║██╔══██║██║╚██╗██║██╔══██║██╔══██║██║╚██╔╝██║██║╚██╔╝██║██╔══██║██╔══██╗<br />
        ╚██████╔╝██║  ██║██║ ╚████║██║  ██║██║  ██║██║ ╚═╝ ██║██║ ╚═╝ ██║██║  ██║██║  ██║<br />
        &nbsp;╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝
    </Header>
);

export default Logo;