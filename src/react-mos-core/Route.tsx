import { Redirect, Route, RouteProps } from 'react-router-dom';

import { auth } from './api';

const MosRoute: React.FC<
    RouteProps & {
        permission?: string;
    }
> = ({ permission, ...rest }) =>
    !permission || auth(permission) ? (
        <Route {...rest} />
    ) : (
        <Redirect to="/403" />
    );

export default MosRoute;
