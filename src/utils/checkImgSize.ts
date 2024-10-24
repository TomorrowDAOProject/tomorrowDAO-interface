export const checkImgSize = (file: File): Promise<boolean> => {
  const reader = new FileReader();
  reader.readAsDataURL(file as Blob);
  return new Promise((resolve) => {
    reader.onload = function (e) {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = function () {
        if (img.width == img.height) {
          resolve(true);
        } else {
          resolve(false);
        }
      };
    };
  });
};
const tolerance = 0.3;
export const checkImgRatio = (file: File, ratio: number | [number, number]): Promise<boolean> => {
  const reader = new FileReader();
  reader.readAsDataURL(file as Blob);
  return new Promise((resolve) => {
    reader.onload = function (e) {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = function () {
        const imageRatio = img.width / img.height;
        if (Array.isArray(ratio)) {
          const [min, max] = ratio;
          if (imageRatio >= min - tolerance && imageRatio <= max + tolerance) {
            resolve(true);
          }
        }
        if (typeof ratio === 'number') {
          if (Math.abs(imageRatio - ratio) < tolerance) {
            resolve(true);
          }
        }
        resolve(false);
      };
    };
  });
};
