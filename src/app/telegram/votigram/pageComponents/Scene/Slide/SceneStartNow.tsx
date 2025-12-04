import { Button } from 'antd';
import { useConfig } from 'components/CmsGlobalConfig/type';
import Scene from '../index';

interface ISceneStartNowProps {
  onStart?: () => void;
}
function SceneStartNow(props: ISceneStartNowProps) {
  const { onStart } = props;
  const { earnScreen } = useConfig() ?? {};
  return (
    <Scene
      className="scene-start-now"
      title={
        <span
          dangerouslySetInnerHTML={{
            __html: `${earnScreen?.title}`,
          }}
        ></span>
      }
      description={
        <span
          dangerouslySetInnerHTML={{
            __html: earnScreen?.subtitle ?? '',
          }}
        ></span>
      }
      imageNode={
        <div className="start-now-image-wrap">
          <img src={'/images/tg/gift.png'} width={175} height={205} alt={''} />
        </div>
      }
      foot={
        <div className="scene-continue-foot">
          <Button type="primary" onClick={onStart}>
            Start Now
          </Button>
        </div>
      }
    />
  );
}
export default SceneStartNow;
