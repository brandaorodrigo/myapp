import './Loading.css';

const Loading: React.FC<{
    status?: boolean;
    opacity?: string;
    style?: React.CSSProperties;
    curtainStyle?: React.CSSProperties;
}> = ({ status = false, style, opacity = '0.8', curtainStyle }) => (
    <div
        className="ant-loading"
        style={{
            display: status ? 'block' : 'none',
            background: `rgba(255, 255, 255, ${opacity})`,
            ...curtainStyle,
        }}
    >
        <span style={style} />
    </div>
);

export default Loading;
