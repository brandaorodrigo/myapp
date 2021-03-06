import React, { useEffect } from 'react';
import mosApi, { mosSignIn, mosSignOut } from 'react-mos-core/mos-api';
import { NavLink, useHistory, useLocation, useParams } from 'react-router-dom';

import { Button, Form, Input } from 'antd';
import PrivateLayout from 'Layouts/Private';
import PublicLayout from 'Layouts/Public';

export const Login: React.FC = () => {
    const { search } = useLocation();
    const history = useHistory();

    const { useForm } = Form;
    const [form] = useForm();

    const onFinish = (submit: { email: string; password: string }) => {
        mosSignIn(submit.email, submit.password)
            .then(() => {
                const query = new URLSearchParams(search);
                history.push(query.get('url') ?? '/');
            })
            .catch((error) => {
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
    };

    return (
        <PublicLayout>
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
        </PublicLayout>
    );
};

export const Logout: React.FC = () => {
    const history = useHistory();

    useEffect(() => {
        setTimeout(() => {
            mosSignOut();
            history.push('/');
        }, 1000);
    }, [history]);

    return <div />;
};

export const Home: React.FC = () => {
    const history = useHistory();
    const { hash, pathname, search } = useLocation();
    const query = new URLSearchParams(search);
    const { id } = useParams<any>();

    useEffect(() => {
        mosApi('/mos/v1/store-management/stores').then((response) => console.log(response));
    }, []);

    return (
        <PrivateLayout>
            <h2>
                QUERY: {query.get('teste')}
                <br />
                HASH: {hash}
                <br />
                ID: {id}
                <br />
                <br />
                NAME: {localStorage.getItem('name')}
                <br />
                <br />
                MALL: {localStorage.getItem('mall')}
                <br />
                token: {localStorage.getItem('token')}
                <br />
                <button
                    onClick={() => {
                        history.push('/reload');
                        history.replace(pathname);
                    }}
                    type="button"
                >
                    RELOAD PAGE
                </button>
                <button
                    onClick={() => {
                        window.localStorage.setItem('mallId', '5');
                        history.push('/');
                        // history.replace(pathname);
                    }}
                    type="button"
                >
                    MALLID = 5
                </button>
                <button
                    onClick={() => {
                        window.localStorage.setItem('mallId', '2');
                        history.push('/');
                        // history.replace(pathname);
                    }}
                    type="button"
                >
                    MALLID = 2
                </button>
                <br />
                <NavLink to="/about/dsdsd?teste=444">TESTE SEARCH</NavLink>
            </h2>
        </PrivateLayout>
    );
};

export const Lost1: React.FC = () => (
    <PrivateLayout>
        <h2>LOST 1</h2>
    </PrivateLayout>
);

export const Lost2: React.FC = () => {
    const { id } = useParams<any>();

    return (
        <PrivateLayout>
            <h2>LOST 2</h2>
            ID: {id}
        </PrivateLayout>
    );
};

export const Lost3: React.FC = () => {
    const { id } = useParams<any>();

    return (
        <PrivateLayout>
            <h2>LOST 3</h2>
            ID: {id}
        </PrivateLayout>
    );
};
