import React, { useEffect } from 'react';
import { NavLink, useHistory, useLocation, useParams } from 'react-router-dom';

import { Button, Form, Input } from 'antd';

import { authentication, permission } from '../api';

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

export const Login: React.FC = () => {
    const { useForm } = Form;
    const [form] = useForm();
    const history = useHistory();

    const onFinish = (submit: any) => {
        authentication<any>(submit.email, submit.password)
            .then(() => {
                if (permission('ACCESS-INMALVIEW')) {
                    history.push('/');
                }
            })
            .catch(() => {
                form.setFields([
                    {
                        name: 'email',
                        errors: ['USUÁRIO OU SENHA INCORRETOS'],
                    },
                    {
                        name: 'password',
                        errors: [''],
                    },
                ]);
            });

        /*
        MosApi<any>('/mos/v1/auth-api/authentication', {
            method: 'POST',
            body: {
                email: submit.email,
                password: submit.password,
            },
        })
            .then((response) => {
                history.push('/');
            })
            .catch(() => {
                form.setFields([
                    {
                        name: 'email',
                        errors: ['USUÁRIO OU SENHA INCORRETOS'],
                    },
                    {
                        name: 'password',
                        errors: [''],
                    },
                ]);
            });
            */
    };

    return (
        <Form form={form} onFinish={onFinish}>
            {React.version}
            <Form.Item label="Username" name="email">
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
    const history = useHistory();

    useEffect(() => {
        setTimeout(() => {
            localStorage.clear();
            sessionStorage.clear();
            history.push('/');
        }, 1000);
    }, [history]);

    return <div />;
};

export const Home: React.FC = () => {
    const history = useHistory();
    const { hash, pathname, search } = useLocation();
    const query = new URLSearchParams(search);
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
            NAME: {localStorage.getItem('name')}
            <br />
            <br />
            MALL: {localStorage.getItem('mall')}
            <br />
            x-access-token: {localStorage.getItem('x-access-token')}
            <br />
            <button
                onClick={() => localStorage.setItem('name', 'XERE')}
                type="button"
            >
                SET NEW NAME
            </button>
            <button
                onClick={() => localStorage.setItem('mall', '333')}
                type="button"
            >
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
