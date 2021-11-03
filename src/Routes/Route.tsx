import {
    Redirect,
    Route as RouteOriginal,
    RouteProps,
    useLocation,
} from 'react-router-dom';

import { mosPermission } from '../api';

// replica o <Route> adicionando regras específicas do mos-api
const Route: React.FC<
    RouteProps & {
        authorized?: boolean;
        permission?: string;
    }
> = ({ authorized, permission, ...rest }) => {
    const { hash, pathname, search } = useLocation();

    // verifica se a rota exige estar logado mas está deslogado
    if (authorized && !localStorage.getItem('x-access-token')) {
        // salva url que estava sento chamada para retornar após login
        localStorage.setItem('redirect', pathname + search + hash);
        return <Redirect to="/" />;
    }

    // verifica se a rota é pública mas o usuário já está logado
    // se ja estiver logado redireciona para a tela inicial do sistema
    if (!authorized && localStorage.getItem('x-access-token')) {
        return <Redirect to="/home" />;
    }

    // verifica a string de permissao fixada na rota
    const allow = permission ? mosPermission(permission) : true;
    if (!allow) {
        return <Redirect to="/403" />;
    }

    // se tudo estiver ok chama o <Route> original do React-Router-Dom
    return <RouteOriginal {...rest} />;
};

export default Route;
