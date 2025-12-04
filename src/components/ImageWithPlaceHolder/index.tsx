import Image, { ImageProps } from 'next/image';
import React, { useState } from 'react';
import clsx from 'clsx';

interface ImageWithPlaceHolderProps {
  src: string;
  text: string;
  alias: string;
  imageProps: Partial<ImageProps>;
}

const ImageWithPlaceHolder: React.FC<ImageWithPlaceHolderProps> = ({
  src,
  text,
  imageProps,
  alias,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="relative w-full h-full rounded-full bg-transparent overflow-hidden">
      <div
        className={clsx('card-title text-white flex-center absolute left-0 top-0 w-full h-full', {
          'z-0': isLoading,
        })}
      >
        {text?.[0] ?? 'D'}
      </div>
      <Image
        src={src}
        alt={text}
        className={clsx('absolute left-0 top-0 w-full h-full', {
          'z-0': isLoading,
        })}
        onLoad={handleImageLoad}
        {...imageProps}
      />
    </div>
  );
};

export default ImageWithPlaceHolder;
