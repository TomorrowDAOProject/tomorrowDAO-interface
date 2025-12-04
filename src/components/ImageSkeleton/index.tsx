/* eslint-disable no-inline-styles/no-inline-styles */
/* eslint-disable jsx-a11y/alt-text */
import React, { useState } from 'react';
import { Skeleton } from 'antd';
import './index.css';
interface IImageWithPlaceholderProps {
  src: string;
}
const ImageWithPlaceholder = (props: IImageWithPlaceholderProps) => {
  const { src } = props;
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="image-skeleton-wrap">
      {!isLoaded && <Skeleton.Image active={true} />}
      <img
        src={src}
        onLoad={() => setIsLoaded(true)}
        style={{
          display: isLoaded ? 'block' : 'none',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};

export default ImageWithPlaceholder;
