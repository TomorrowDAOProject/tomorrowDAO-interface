export const serverGetSSRData = async <T>(fn: () => Promise<T>) => {
  try {
    const data = await fn();
    return {
      data,
      error: null,
    };
  } catch (error: any) {
    console.error('serverGetSSRData error:', error);
    return {
      data: null,
      error: error,
    };
  }
};
