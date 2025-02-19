import React from 'react';
import clsx from 'clsx';

interface StatisticProps {
  title: React.ReactNode;
  value: number | string;
  className?: string;
}

const Statistic: React.FC<StatisticProps> = ({ title, value, className }) => {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-[6px]', className)}>
      <div className="text-desc12 text-lightGrey font-Montserrat mb-4 flex items-center gap-[2px]">
        {title}
      </div>
      <div className="text-descM18 text-white font-Montserrat">{value}</div>
    </div>
  );
};

const Countdown: React.FC<StatisticProps & { format?: string; onFinish?: () => void }> = ({
  title,
  value,
  format = 'D day HH : mm : ss',
  onFinish,
  className,
}) => {
  console.log('value', value);
  const [timeLeft, setTimeLeft] = React.useState<number>(
    typeof value === 'number' ? value - Date.now() : 0,
  );

  React.useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = typeof value === 'number' ? value - Date.now() : 0;
      setTimeLeft(newTimeLeft);

      if (newTimeLeft <= 0) {
        clearInterval(timer);
        onFinish?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [value, onFinish]);

  const formatTime = (ms: number) => {
    if (ms <= 0) return '0 day 00 : 00 : 00';

    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    const hours = Math.floor((ms / 1000 / 60 / 60) % 24);
    const days = Math.floor(ms / 1000 / 60 / 60 / 24);

    return format
      .replace('D', days.toString())
      .replace('HH', hours.toString().padStart(2, '0'))
      .replace('mm', minutes.toString().padStart(2, '0'))
      .replace('ss', seconds.toString().padStart(2, '0'));
  };

  return (
    <div className={clsx('flex flex-col items-center justify-center py-[6px]', className)}>
      <div className="flex items-center text-desc12 text-lightGrey font-Montserrat mb-4">
        {title}
      </div>
      <div className="text-descM18 text-white font-Montserrat">{formatTime(timeLeft)}</div>
    </div>
  );
};

export { Countdown };
export default Statistic;
