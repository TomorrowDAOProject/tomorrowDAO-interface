import { Button } from 'antd';
import { useConfig } from 'components/CmsGlobalConfig/type';
import Scene from '../index';
import { ImageLoveNode } from '../ImageLoveNode';

interface ISceneContinueProps {
  onContinue?: () => void;
}
function SceneContinue(props: ISceneContinueProps) {
  const { onContinue } = props;
  const { loginScreen } = useConfig() ?? {};
  return (
    <Scene
      className="scene-continue"
      title={
        <span
          dangerouslySetInnerHTML={{
            __html: `${loginScreen?.title}`,
          }}
        ></span>
      }
      description={
        <span
          dangerouslySetInnerHTML={{
            __html: loginScreen?.subtitle ?? '',
          }}
        ></span>
      }
      imageNode={<ImageLoveNode />}
      foot={
        <div className="scene-continue-foot">
          <Button type="primary" onClick={onContinue}>
            Continue
          </Button>
        </div>
      }
    />
  );
}
export default SceneContinue;
