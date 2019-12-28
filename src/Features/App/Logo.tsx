import React, { FC, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

enum HeaderSizes {
    XXSmall,
    XSmall,
    Small,
    Medium,
    Large,
};

type HeaderProps = {
    size: HeaderSizes,
};

const Header = styled.div`
    display: flex;
    justify-content: center;
`;

const Container = styled.pre`
    margin: 0;
    ${({ size }: HeaderProps) => size === HeaderSizes.XXSmall && css`
        font-size: 5.5px;
    `}
    ${({ size }: HeaderProps) => size === HeaderSizes.XSmall && css`
        font-size: 6.5px;
    `}
    ${({ size }: HeaderProps) => size === HeaderSizes.Small && css`
        font-size: 8px;
    `}
    ${({ size }: HeaderProps) => size === HeaderSizes.Medium && css`
        font-size: 12px;
    `}
    ${({ size }: HeaderProps) => size === HeaderSizes.Large && css`
        font-size: 16px;
    `}
`;

type LogoProps = {
    className?: string,
};

const Logo: FC<LogoProps> = ({ className }) => {
    const getSize = () => {
        if (window.innerWidth < 380) {
            return HeaderSizes.XXSmall;
        } else if (window.innerWidth < 500) {
            return HeaderSizes.XSmall;
        } else if (window.innerWidth < 650) {
            return HeaderSizes.Small;
        } else if (window.innerWidth < 820) {
            return HeaderSizes.Medium;
        }

        return HeaderSizes.Large;
    };

    const [size, setSize] = useState<HeaderSizes>(getSize());

    useEffect(() => {
        window.addEventListener('resize', (event) => {
            setSize(getSize());
        });
    });

    return (
        <Header className={className}>
            <Container size={size}>
                &nbsp;██████╗  █████╗ ███╗   ██╗██╗  ██╗ █████╗ ███╗   ███╗███╗   ███╗ █████╗ ██████╗ <br />
                ██╔════╝ ██╔══██╗████╗  ██║██║  ██║██╔══██╗████╗ ████║████╗ ████║██╔══██╗██╔══██╗<br />
                ██║  ███╗███████║██╔██╗ ██║███████║███████║██╔████╔██║██╔████╔██║███████║██████╔╝<br />
                ██║   ██║██╔══██║██║╚██╗██║██╔══██║██╔══██║██║╚██╔╝██║██║╚██╔╝██║██╔══██║██╔══██╗<br />
                ╚██████╔╝██║  ██║██║ ╚████║██║  ██║██║  ██║██║ ╚═╝ ██║██║ ╚═╝ ██║██║  ██║██║  ██║<br />
                &nbsp;╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝
            </Container>
        </Header>
    );
}

export default Logo;