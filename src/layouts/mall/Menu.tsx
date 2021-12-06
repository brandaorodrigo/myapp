import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { Menu } from 'antd';
import { MenuProps, SubMenuProps } from 'antd/lib';
import MosApi from 'api';
import {
    BabyCareIcon,
    CampaignIcon,
    CustomerServiceIcon,
    FlashIcon,
    InCustomerViewIcon,
    InMallViewIcon,
    InStoreViewIcon,
    LoanIcon,
    LostFoundIcon,
    PromotionIcon,
    SettingsIcon,
    SpotIcon,
} from 'components/Icons';

const { Item } = Menu;

// adiciona no componente "antd/Menu.SubMenu" prop para ocultar ou exibir
const SubMenu: React.FC<SubMenuProps & { hidden?: boolean }> = ({
    hidden = false,
    children,
    ...rest
}) => !hidden && <Menu.SubMenu {...rest}>{children}</Menu.SubMenu>;

const Export: React.FC<MenuProps> = ({ ...props }) => {
    const history = useHistory();
    const { pathname } = useLocation();

    const [openKey, setOpenKey] = useState(`/${pathname.split('/')[1]}`);

    const mallId = Number(window.localStorage.getItem('mallId'));
    const [permissions, setPermissions] = useState<string[]>([]);

    useEffect(() => {
        MosApi<any>('/mos/v1/auth-api/employee-permissions/', {
            cache: true,
        }).then((response) => {
            const mall = response?.malls?.find(({ id }) => id === mallId);
            const permissions = mall?.role?.permissions.map(({ code }) => code);
            permissions && setPermissions(permissions);
        });
    }, [mallId]);

    const hidden = (search: string) =>
        !permissions?.find((value) => value === search);

    return (
        <>
            <header>
                <SpotIcon />
            </header>
            <Menu
                mode="inline"
                onClick={({ key }) => history.push(key)}
                onOpenChange={(keys: string[]) =>
                    setOpenKey(keys[keys.length - 1])
                }
                openKeys={[openKey]}
                selectedKeys={[pathname]}
                {...props}
            >
                <Item
                    hidden={hidden('ACCESS-INMALVIEW')}
                    icon={<InMallViewIcon />}
                    key="/view/mall"
                >
                    InMall View
                </Item>
                <Item
                    hidden={hidden('ACCESS-CUSTOMERVIEW')}
                    icon={<InCustomerViewIcon />}
                    key="/view/customer"
                >
                    Customer View
                </Item>
                <Item
                    hidden={hidden('ACCESS-INSTOREVIEW')}
                    icon={<InStoreViewIcon />}
                    key="/view/store"
                >
                    Instore View
                </Item>
                <SubMenu
                    hidden={hidden('ACCESS-FLASH')}
                    icon={<FlashIcon />}
                    key="/flash"
                    title="Flash"
                >
                    <Item hidden={hidden('CREATE-FLASH')} key="/flash/push">
                        Novo
                    </Item>
                    <Item hidden={hidden('LIST-FLASH')} key="/flash/control">
                        Controle
                    </Item>
                    <Item hidden={hidden('REPORT-FLASH')} key="/flash/report">
                        Relatórios
                    </Item>
                </SubMenu>
                <SubMenu
                    hidden={hidden('ACCESS-CAMPAIGN')}
                    icon={<CampaignIcon />}
                    key="/campaign"
                    title="Campanhas"
                >
                    <Item
                        hidden={hidden('CREATE-CAMPAIGN')}
                        key="/campaign/push"
                    >
                        Novo
                    </Item>
                    <Item
                        hidden={hidden('LIST-CAMPAIGN')}
                        key="/campaign/control"
                    >
                        Controle
                    </Item>
                    <Item
                        hidden={hidden('REPORT-CAMPAIGN')}
                        key="/campaign/report"
                    >
                        Relatórios
                    </Item>
                </SubMenu>
                <Item
                    hidden={hidden('ACCESS-PROMOTIONS')}
                    icon={<PromotionIcon />}
                    key="/promotion/control"
                >
                    Promoções
                </Item>
                <SubMenu
                    hidden={hidden('ACCESS-CUSTOMERSERVICE')}
                    icon={<CustomerServiceIcon />}
                    key="/customer-service"
                    title="SAC"
                >
                    <Item
                        hidden={hidden('ACCESS-CUSTOMERSERVICE')}
                        key="/customer-service/push"
                    >
                        Novo
                    </Item>
                    <Item
                        hidden={hidden('LIST-CUSTOMERSERVICE')}
                        key="/customer-service/control"
                    >
                        Controle
                    </Item>
                </SubMenu>
                <SubMenu
                    hidden={hidden('ACCESS-LOAN')}
                    icon={<LoanIcon />}
                    key="/loan"
                    title="Empréstimo"
                >
                    <Item hidden={hidden('CREATE-LOAN')} key="/loan/push">
                        Novo
                    </Item>
                    <Item hidden={hidden('LIST-LOAN')} key="/loan/control">
                        Controle
                    </Item>
                </SubMenu>
                <SubMenu
                    hidden={hidden('ACCESS-LOST-FOUND')}
                    icon={<LostFoundIcon />}
                    key="/lost-found"
                    title="Achados e Perdidos"
                >
                    <Item
                        hidden={hidden('CREATE-LOST-FOUND')}
                        key="/lost-found/push"
                    >
                        Novo
                    </Item>
                    <Item
                        hidden={hidden('LIST-LOST-FOUND')}
                        key="/lost-found/control"
                    >
                        Controle
                    </Item>
                    <Item
                        hidden={hidden('ACCESS-LOST-FOUND')}
                        key="/lost-found/lost-control"
                    >
                        Perdidos
                    </Item>
                    <Item
                        hidden={hidden('ACCESS-LOST-FOUND')}
                        key="/lost-found/actions"
                    >
                        Doação/Destruição
                    </Item>
                </SubMenu>
                <SubMenu
                    hidden={hidden('ACCESS-BABYCARE')}
                    icon={<BabyCareIcon />}
                    key="/babycare"
                    title="Fraldário"
                >
                    <Item
                        hidden={hidden('CREATE-BABYCARE')}
                        key="/babycare/push"
                    >
                        Novo
                    </Item>
                    <Item
                        hidden={hidden('LIST-BABYCARE')}
                        key="/babycare/control"
                    >
                        Controle
                    </Item>
                    <Item
                        hidden={hidden('REPORT-BABYCARE')}
                        key="/babycare/report"
                    >
                        Relatórios
                    </Item>
                </SubMenu>
                <SubMenu
                    hidden={hidden('ACCESS-SETTINGS')}
                    icon={<SettingsIcon />}
                    key="/config"
                    title="Configurações"
                >
                    <Item
                        hidden={hidden('SETTINGS-STORES')}
                        key="/config/store/push"
                    >
                        Loja | Nova
                    </Item>
                    <Item
                        hidden={hidden('SETTINGS-STORES')}
                        key="/config/store/control"
                    >
                        Loja | Controle
                    </Item>
                    <Item
                        hidden={hidden('SETTINGS-STORES')}
                        key="/config/employee/push"
                    >
                        Operador | Novo
                    </Item>
                    <Item
                        hidden={hidden('SETTINGS-STORES')}
                        key="/config/employee/control"
                    >
                        Operador | Controle
                    </Item>
                    <Item
                        hidden={hidden('ACCESS-SETTINGS')}
                        key="/config/lucs/push"
                    >
                        Lucs | Novo
                    </Item>
                    <Item
                        hidden={hidden('ACCESS-SETTINGS')}
                        key="/config/lucs/control"
                    >
                        Lucs | Controle
                    </Item>
                    <Item
                        hidden={hidden('ACCESS-SETTINGS')}
                        key="/config/found_item/push"
                    >
                        Achados | Item | Novo
                    </Item>
                    <Item
                        hidden={hidden('ACCESS-SETTINGS')}
                        key="/config/found_item/control"
                    >
                        Achados | Item | Controle
                    </Item>
                    <Item
                        hidden={hidden('CREATE-LOAN-ITEM')}
                        key="/config/loan_item/push"
                    >
                        Emp. | Item | Novo
                    </Item>
                    <Item
                        hidden={hidden('CREATE-LOAN-ITEM')}
                        key="/config/loan_item/control"
                    >
                        Emp. | Item | Controle
                    </Item>
                    <Item
                        hidden={hidden('CREATE-LOAN-ITEM')}
                        key="/config/loan_type/push"
                    >
                        Emp. | Tipo | Novo
                    </Item>
                    <Item
                        hidden={hidden('CREATE-LOAN-ITEM')}
                        key="/config/loan_type/control"
                    >
                        Emp. | Tipo | Controle
                    </Item>
                    <Item
                        hidden={hidden('ACCESS-SETTINGS')}
                        key="/config/customFielsdsGroup/control"
                    >
                        Custom | Grupos
                    </Item>
                    <Item
                        hidden={hidden('ACCESS-SETTINGS')}
                        key="/config/customFielsdsGroup/push"
                    >
                        Custom | Novo Grupo
                    </Item>
                    <Item
                        hidden={hidden('ACCESS-SETTINGS')}
                        key="/config/customFields/control"
                    >
                        Custom | Campos
                    </Item>
                    <Item
                        hidden={hidden('ACCESS-SETTINGS')}
                        key="/config/customFields/push"
                    >
                        Custom | Novo Campo
                    </Item>
                    <Item
                        hidden={hidden('ACCESS-SETTINGS')}
                        key="/config/customFields/order"
                    >
                        Custom | Ordenação
                    </Item>
                    <Item key="/config/loan/push">teste 3 niveis</Item>
                </SubMenu>
            </Menu>
        </>
    );
};

export default Export;
