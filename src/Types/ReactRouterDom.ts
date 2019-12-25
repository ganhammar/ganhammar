// types/react-router-dom.d.ts
import { RouteComponentProps } from 'react-router-dom';
import { Context } from 'react';

declare module 'react-router-dom' {
  export const __RouterContext: Context<RouteComponentProps<{}>>;
}