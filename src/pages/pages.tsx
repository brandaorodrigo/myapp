import React, { useCallback, useEffect } from 'react';
import { NavLink, useHistory, useLocation, useParams } from 'react-router-dom';

import { Button, Form, Input } from 'antd';

import { useStorageContext } from '../react-storage-state';

/* ========================================================================== */
/* ========================================================================== */
/* TEMPLATE ================================================================= */
/* ========================================================================== */

export const PrivateLayout: React.FC = ({ children }) => (
    <div>
        <div style={{ padding: '20px', background: '#dd88aa' }}>
            <NavLink activeClassName="active" to="/">
                HOME
            </NavLink>
        </div>
        <div style={{ padding: '20px', background: '#dd88aa' }}>
            <NavLink activeClassName="active" to="/about">
                ABOUT
            </NavLink>
        </div>
        <div style={{ padding: '20px', background: '#aa65aa' }}>
            <NavLink to="/logout">SAIR</NavLink>
        </div>

        <div style={{ background: '#0ee' }}>{children}</div>
    </div>
);

export const PublicLayout: React.FC = ({ children }) => (
    <div style={{ background: '#ee0' }}>{children}</div>
);

/* ========================================================================== */
/* PAGES ==================================================================== */
/* ========================================================================== */

export const Login: React.FC = () => {
    const useStorage = useStorageContext();
    const [, setToken] = useStorage('token');
    const [, setMall] = useStorage('mall');

    const history = useHistory();

    const onFinish = () => {
        setToken('tokenValue');
        setMall('mallValue');
        history.push('/');
    };

    return (
        <Form onFinish={onFinish}>
            <Form.Item label="Username" name="username">
                <Input />
            </Form.Item>
            <Form.Item label="Password" name="password">
                <Input.Password />
            </Form.Item>
            <Form.Item>
                <Button htmlType="submit">Submit</Button>
            </Form.Item>
        </Form>
    );
};

export const Logout: React.FC = () => {
    const useStorage = useStorageContext();
    const [, setToken] = useStorage('token');
    const [, setMall] = useStorage('mall');

    const history = useHistory();

    const handleLogout = useCallback(() => {
        setToken(undefined);
        setMall(undefined);
        history.push('/');
    }, [history, setToken, setMall]);

    useEffect(() => {
        setTimeout(() => {
            handleLogout();
        }, 1000);
    }, [handleLogout]);

    return <div />;
};

export const Home: React.FC = () => {
    const useStorage = useStorageContext();
    const [token, setToken] = useStorage('token');
    const [mall, setMall] = useStorage('mall');

    const { search, hash } = useLocation();

    const history = useHistory();

    const query = new URLSearchParams(search);

    const { pathname } = useLocation();

    const { id, idd } = useParams<any>();

    return (
        <h2>
            QUERY: {query.get('teste')}
            <br />
            HASH: {hash}
            <br />
            ID: {id}
            <br />
            IDD: {idd}
            <br />
            <br />
            STATE-TOKEN: {token}
            <br />
            <br />
            MALL: {mall}
            <br />
            localStorage: {localStorage.getItem('token')}
            <br />
            <button onClick={() => setToken('newTokenValue')} type="button">
                SET NEW TOKEN
            </button>
            <button onClick={() => setMall('newMallValue')} type="button">
                SET NEW MALL
            </button>
            <button
                onClick={() => {
                    history.push('/reload');
                    history.replace(pathname);
                }}
                type="button"
            >
                RELOAD PAGE
            </button>
            <br />
            <NavLink to="/about/dsdsd?teste=444">TESTE SEARCH</NavLink>
        </h2>
    );
};
