import { withRouter } from 'react-router-dom';

import { Col, Row } from 'antd';
import { ReactComponent as SpotMetrics } from 'components/Icons/SpotMetrics.svg';

import Routes from './Routes';
import './Body.css';

const Body: React.FC = () => (
    <div className="auth-body">
        <Row className="main" justify="center">
            <Col span={24}>
                <Row>
                    <Col span={24}>
                        <article>
                            <SpotMetrics className="logo" />
                            <Routes />
                        </article>
                    </Col>
                    <Col span={24}>
                        <Row align="middle" className="footer" gutter={20}>
                            <Col span={8}>
                                <div className="line" />
                            </Col>
                            <Col span={8}>ATENDIMENTO</Col>
                            <Col span={8}>
                                <div className="line" />
                            </Col>
                            <Col className="contact" span={24}>
                                (21) 3900-9938 | ATENDIMENTO@SPOTMETRICS.COM
                                <br />
                                <br />
                                SEGUNDA À SÁBADO - 09H ÀS 22H
                                <br />
                                DOMINGO E FERIADO - 12H ÀS 21H
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Col>
        </Row>
    </div>
);

export default withRouter(Body);
