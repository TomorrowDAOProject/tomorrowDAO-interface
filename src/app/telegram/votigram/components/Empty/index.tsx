import './index.css';

interface IEmptyProps {
  style: React.CSSProperties;
  imageUrl: string;
  title: string;
  description: string;
}
export default function Empty(props: IEmptyProps) {
  const { style, imageUrl, title, description } = props;
  return (
    <div className="telegrame-empty-wrap" style={style}>
      <img src={imageUrl} alt="empty" width={96} height={96} />
      <h3 className="title font-16-20-weight">{title}</h3>
      <p className="desc font-14-18">{description}</p>
    </div>
  );
}
