import { useState } from 'react';
import SceneContinue from './SceneContinue';
import SceneStartNow from './SceneStartNow';
import './index.css';

interface ISlideProps {
  onFinish?: () => void;
}
export default function Slide(props: ISlideProps) {
  const { onFinish } = props;
  const [step, setStep] = useState(0);
  return (
    <div>
      {step === 0 && (
        <SceneContinue
          onContinue={() => {
            setStep(1);
          }}
        />
      )}
      {step === 1 && (
        <SceneStartNow
          onStart={() => {
            onFinish?.();
          }}
        />
      )}
      <ul className="slide-dots">
        <li className={`${step === 0 ? 'active' : ''}`}></li>
        <li className={`${step === 1 ? 'active' : ''}`}></li>
      </ul>
    </div>
  );
}
