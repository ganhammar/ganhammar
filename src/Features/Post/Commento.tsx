import React, { useEffect, FC } from 'react';
import styled from 'styled-components';

// Helper to add scripts to our page
const insertScript = (src: string, id: string, parentElement: HTMLElement) => {
    const script = window.document.createElement('script');
    script.async = true;
    script.src = src;
    script.id = id;
    parentElement.appendChild(script);
    return script;
};

// Helper to remove scripts from our page
const removeScript = (id: string, parentElement: HTMLElement) => {
    const script = window.document.getElementById(id);

    if (script) {
        parentElement.removeChild(script);
    }
};

const Wrapper = styled.div``;

type CommentoProps = {
    id: string,
    className?: string,
};

// The actual component
const Commento: FC<CommentoProps> = ({ id, className }) => {
    useEffect(() => {
        // If there's no window there's nothing to do for us
        if (!window) {
            return;
        }

        const document = window.document;

        // In case our #commento container exists we can add our commento script
        if (document.getElementById('commento')) {
            insertScript('https://cdn.commento.io/js/commento.js', id, document.body);
        }

        // Cleanup; remove the script from the page
        return () => removeScript('commento-script', document.body);
    }, [id]);

    return <Wrapper className={className} id="commento" />
};

export default Commento;