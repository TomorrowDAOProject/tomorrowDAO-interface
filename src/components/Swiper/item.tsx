const Item = ({ children }: React.PropsWithChildren<{ children: React.ReactNode }>) => {
  return <div className="h-full w-full">{children}</div>;
};

export default Item;
