import './Loading.css';

const Loading: React.FC<{
    curtainStyle?: React.CSSProperties;
    opacity?: string;
    status?: boolean;
    style?: React.CSSProperties;
}> = ({ status = false, style, opacity = '0.8', curtainStyle }) => (
    <div
        className="ant-loading"
        style={{
            background: `rgba(255, 255, 255, ${opacity})`,
            display: status ? 'block' : 'none',
            ...curtainStyle,
        }}
    >
        <span style={style} />
    </div>
);

export default Loading;
