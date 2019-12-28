import React, { Component } from 'react';

import NotFound from './NotFound';

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

        return <NotFound onBackClick={() => this.setState({ hasError: false })} />;
    }
}

export default AppError;