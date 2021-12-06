import React, { useEffect, useState } from 'react';
import {
    Route as DefaultRoute,
    Redirect,
    RouteProps,
    Switch,
    useLocation,
    withRouter,
} from 'react-router-dom';

import MosApi from 'api';
import Logout from 'pages/auth/logout';
import BabyCareControl from 'pages/babycare/control';
import BabycareDetails from 'pages/babycare/details';
import BabyCarePush from 'pages/babycare/push';
import BabyCareReport from 'pages/babycare/report';
import CampaignControl from 'pages/campaign/control';
import CampaignPush from 'pages/campaign/push';
import CampaignReport from 'pages/campaign/report';
import CustomFieldsControl from 'pages/config/customFields/control';
import CustomFieldsOrder from 'pages/config/customFields/order';
import CustomFieldsPush from 'pages/config/customFields/push';
import CustomFieldsGroupControl from 'pages/config/customFielsdsGroup/control';
import CustomFieldsGroupPush from 'pages/config/customFielsdsGroup/push';
import EmployeeControl from 'pages/config/employee/control';
import EmployeePush from 'pages/config/employee/push';
import FoundItemControl from 'pages/config/found_item/control';
import FoundItemPush from 'pages/config/found_item/push';
import LoanItemControl from 'pages/config/loan_item/control';
import LoanItemPush from 'pages/config/loan_item/push';
import LoanTypeControl from 'pages/config/loan_type/control';
import LoanTypePush from 'pages/config/loan_type/push';
import LucsControl from 'pages/config/lucs/control';
import LucsPush from 'pages/config/lucs/push';
import ShopKeeperControl from 'pages/config/shopkeepers/control';
import ShopKeeperPush from 'pages/config/shopkeepers/push';
import StoreControl from 'pages/config/store/control';
import StoreDetails from 'pages/config/store/details';
import StorePush from 'pages/config/store/push';
import CustomerServiceControl from 'pages/customer-service/control';
import CustomerServicePush from 'pages/customer-service/push';
import CustomerServiceTickets from 'pages/customer-service/tickets';
import FlashControl from 'pages/flash/control';
import FlashPush from 'pages/flash/push';
import Home from 'pages/home';
import LoanPush from 'pages/loan/push';
import NotFoundPage from 'pages/notfound';
import Own from 'pages/own';
import ViewMall from 'pages/view/mall';
import ViewCustomer from 'pages/view/customer';
import ViewStore from 'pages/view/store';
import FlashReport from 'pages/flash/report';
import PromotionOperation from 'pages/promotion/control';
import CustomerServiceShortTickets from 'pages/customer-service/short-tickets';
import LoanControl from 'pages/loan/control';
import LoanDetails from 'pages/loan/details';
import LostFoundPush from 'pages/lost-found/push';
import LostFoundControl from 'pages/lost-found/control';
import LostFoundDetails from 'pages/lost-found/details';
import LostFoundActions from 'pages/lost-found/actions';
import LostControl from 'pages/lost-found/lost-control';
import LostPush from 'pages/lost-found/lost';

// react-router-dom/Route don't have a hidden prop
const Route: React.FC<RouteProps & { hidden?: boolean }> = ({
    hidden = false,
    ...rest
}) => (hidden ? <Redirect to="/403" /> : <DefaultRoute {...rest} />);

const Routes: React.FC = () => {
    useLocation();

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
            {permissions.length > 0 && (
                <Switch>
                    {/* default */}
                    <Route
                        exact
                        path="/"
                        render={() =>
                            hidden('ACCESS-INMALVIEW') ? (
                                <Redirect to="/home" />
                            ) : (
                                <Redirect to="/view/mall" />
                            )
                        }
                    />
                    <Route component={Own} exact path="/own" />
                    <Route component={Home} exact path="/home" />
                    <Route component={Logout} exact path="/logout" />
                    <Route component={NotFoundPage} exact path="/404" />
                    {/* Routes Views */}
                    <Route
                        component={ViewMall}
                        exact
                        hidden={hidden('ACCESS-INMALVIEW')}
                        path="/view/mall"
                    />
                    <Route
                        component={ViewCustomer}
                        exact
                        hidden={hidden('ACCESS-CUSTOMERVIEW')}
                        path="/view/customer"
                    />
                    <Route
                        component={ViewStore}
                        exact
                        hidden={hidden('ACCESS-INSTOREVIEW')}
                        path="/view/store"
                    />
                    {/* Routes marketing */}
                    <Route
                        component={FlashPush}
                        exact
                        hidden={hidden('CREATE-FLASH')}
                        path="/flash/push"
                    />
                    <Route
                        component={FlashPush}
                        exact
                        hidden={hidden('CREATE-FLASH')}
                        path="/flash/push/:id"
                    />
                    <Route
                        component={FlashControl}
                        exact
                        hidden={hidden('LIST-FLASH')}
                        path="/flash/control"
                    />
                    <Route
                        component={FlashReport}
                        exact
                        hidden={hidden('REPORT-FLASH')}
                        path="/flash/report"
                    />
                    <Route
                        component={FlashReport}
                        exact
                        hidden={hidden('REPORT-FLASH')}
                        path="/flash/report/:id"
                    />
                    <Route
                        component={CampaignPush}
                        exact
                        hidden={hidden('CREATE-CAMPAIGN')}
                        path="/campaign/push"
                    />
                    <Route
                        component={CampaignPush}
                        exact
                        hidden={hidden('CREATE-CAMPAIGN')}
                        path="/campaign/push/:id"
                    />
                    <Route
                        component={CampaignControl}
                        exact
                        hidden={hidden('LIST-CAMPAIGN')}
                        path="/campaign/control"
                    />
                    <Route
                        component={CampaignReport}
                        exact
                        hidden={hidden('REPORT-CAMPAIGN')}
                        path="/campaign/report"
                    />
                    <Route
                        component={CampaignReport}
                        exact
                        hidden={hidden('REPORT-CAMPAIGN')}
                        path="/campaign/report/:id"
                    />
                    <Route
                        component={PromotionOperation}
                        exact
                        hidden={hidden('ACCESS-PROMOTIONS')}
                        path="/promotion/control"
                    />
                    {/* Routes Facility */}
                    <Route
                        component={CustomerServicePush}
                        exact
                        hidden={hidden('CREATE-CUSTOMERSERVICE')}
                        path="/customer-service/push"
                    />
                    <Route
                        component={CustomerServiceControl}
                        exact
                        hidden={hidden('LIST-CUSTOMERSERVICE')}
                        path="/customer-service/control"
                    />
                    <Route
                        component={CustomerServiceTickets}
                        exact
                        hidden={hidden('ACCESS-CUSTOMERSERVICE')}
                        path="/customer-service/tickets/:id"
                    />
                    <Route
                        component={CustomerServiceShortTickets}
                        exact
                        hidden={hidden('ACCESS-CUSTOMERSERVICE')}
                        path="/customer-service/short-tickets/:id"
                    />
                    <Route
                        component={LoanPush}
                        exact
                        hidden={hidden('CREATE-LOAN')}
                        path="/loan/push"
                    />
                    <Route
                        component={LoanDetails}
                        exact
                        hidden={hidden('LIST-LOAN')}
                        path="/loan/details/:id"
                    />
                    <Route
                        component={LoanControl}
                        exact
                        hidden={hidden('LIST-LOAN')}
                        path="/loan/control"
                    />
                    <Route
                        component={LostFoundPush}
                        exact
                        hidden={hidden('CREATE-LOST-FOUND')}
                        path="/lost-found/push"
                    />
                    <Route
                        component={LostFoundControl}
                        exact
                        hidden={hidden('LIST-LOST-FOUND')}
                        path="/lost-found/control"
                    />
                    <Route
                        component={LostFoundDetails}
                        exact
                        hidden={hidden('ACCESS-LOST-FOUND')}
                        path="/lost-found/details/:id"
                    />
                    <Route
                        component={LostControl}
                        exact
                        hidden={hidden('ACCESS-LOST-FOUND')}
                        path="/lost-found/lost-control"
                    />
                    <Route
                        component={LostPush}
                        exact
                        hidden={hidden('ACCESS-LOST-FOUND')}
                        path="/lost-found/lost"
                    />
                    <Route
                        component={LostFoundActions}
                        exact
                        hidden={hidden('ACCESS-LOST-FOUND')}
                        path="/lost-found/actions"
                    />
                    <Route
                        component={BabyCarePush}
                        exact
                        hidden={hidden('CREATE-BABYCARE')}
                        path="/babycare/push"
                    />
                    <Route
                        component={BabyCareControl}
                        exact
                        hidden={hidden('LIST-BABYCARE')}
                        path="/babycare/control"
                    />
                    <Route
                        component={BabycareDetails}
                        exact
                        hidden={hidden('ACCESS-BABYCARE')}
                        path="/babycare/details/:id"
                    />
                    <Route
                        component={BabyCareReport}
                        exact
                        hidden={hidden('REPORT-BABYCARE')}
                        path="/babycare/report"
                    />
                    {/* Routes Settings */}
                    <Route
                        component={EmployeePush}
                        exact
                        hidden={hidden('SETTINGS-STORES')}
                        path="/config/employee/push"
                    />
                    <Route
                        component={EmployeePush}
                        exact
                        hidden={hidden('SETTINGS-STORES')}
                        path="/config/employee/push/:id"
                    />
                    <Route
                        component={EmployeeControl}
                        exact
                        hidden={hidden('SETTINGS-STORES')}
                        path="/config/employee/control"
                    />
                    <Route
                        component={StorePush}
                        exact
                        hidden={hidden('SETTINGS-STORES')}
                        path="/config/store/push"
                    />
                    <Route
                        component={StorePush}
                        exact
                        hidden={hidden('SETTINGS-STORES')}
                        path="/config/store/push/:id"
                    />
                    <Route
                        component={StoreControl}
                        exact
                        hidden={hidden('SETTINGS-STORES')}
                        path="/config/store/control"
                    />
                    <Route
                        component={StoreDetails}
                        exact
                        hidden={hidden('SETTINGS-STORES')}
                        path="/config/store/details/:id"
                    />
                    <Route
                        component={ShopKeeperPush}
                        exact
                        hidden={hidden('SETTINGS-STORES')}
                        path="/config/shopkeepers/push/:storeId"
                    />
                    <Route
                        component={ShopKeeperControl}
                        exact
                        hidden={hidden('SETTINGS-STORES')}
                        path="/config/shopkeepers/control/:storeId"
                    />
                    <Route
                        component={LucsPush}
                        exact
                        hidden={hidden('SETTINGS-STORES')}
                        path="/config/lucs/push"
                    />
                    <Route
                        component={LucsControl}
                        exact
                        hidden={hidden('SETTINGS-STORES')}
                        path="/config/lucs/control"
                    />
                    <Route
                        component={LucsPush}
                        exact
                        hidden={hidden('SETTINGS-STORES')}
                        path="/config/lucs/push/:id"
                    />
                    <Route
                        component={FoundItemPush}
                        exact
                        hidden={hidden('SETTINGS-STORES')}
                        path="/config/found_item/push"
                    />
                    <Route
                        component={FoundItemControl}
                        exact
                        hidden={hidden('SETTINGS-STORES')}
                        path="/config/found_item/control"
                    />
                    <Route
                        component={FoundItemPush}
                        exact
                        hidden={hidden('SETTINGS-STORES')}
                        path="/config/found_item/push/:id"
                    />
                    <Route
                        component={LoanItemPush}
                        exact
                        hidden={hidden('SETTINGS-STORES')}
                        path="/config/loan_item/push"
                    />
                    <Route
                        component={LoanItemControl}
                        exact
                        hidden={hidden('SETTINGS-STORES')}
                        path="/config/loan_item/control"
                    />
                    <Route
                        component={LoanItemPush}
                        exact
                        hidden={hidden('SETTINGS-STORES')}
                        path="/config/loan_item/push/:id"
                    />
                    <Route
                        component={LoanTypePush}
                        exact
                        hidden={hidden('SETTINGS-STORES')}
                        path="/config/loan_type/push"
                    />
                    <Route
                        component={LoanTypeControl}
                        exact
                        hidden={hidden('SETTINGS-STORES')}
                        path="/config/loan_type/control"
                    />
                    <Route
                        component={LoanTypePush}
                        exact
                        hidden={hidden('SETTINGS-STORES')}
                        path="/config/loan_type/push/:id"
                    />
                    <Route
                        component={CustomFieldsGroupPush}
                        exact
                        hidden={hidden('SETTINGS-STORES')}
                        path="/config/customFielsdsGroup/push"
                    />
                    <Route
                        component={CustomFieldsGroupControl}
                        exact
                        hidden={hidden('SETTINGS-STORES')}
                        path="/config/customFielsdsGroup/control"
                    />
                    <Route
                        component={CustomFieldsGroupPush}
                        exact
                        hidden={hidden('SETTINGS-STORES')}
                        path="/config/customFielsdsGroup/push/:id"
                    />
                    <Route
                        component={CustomFieldsPush}
                        exact
                        hidden={hidden('SETTINGS-STORES')}
                        path="/config/customFields/push"
                    />
                    <Route
                        component={CustomFieldsControl}
                        exact
                        hidden={hidden('SETTINGS-STORES')}
                        path="/config/customFields/control"
                    />
                    <Route
                        component={CustomFieldsOrder}
                        exact
                        hidden={hidden('SETTINGS-STORES')}
                        path="/config/customFields/order"
                    />
                    <Route render={() => <Redirect to="/404" />} />{' '}
                </Switch>
            )}
        </>
    );
};

export default withRouter(Routes);
