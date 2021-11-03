import { NavLink } from 'react-router-dom';

const PrivateLayout: React.FC = ({ children }) => (
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

export default PrivateLayout;
