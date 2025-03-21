import React from 'react';
export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="tmrwdao-grid md:max-w-[608px] lg:max-w-[870px] xl:max-w-[1050px] xl:!px-[3.75rem] z-0">
      <div className="col-12 min-h-[calc(100lvh-223px)] lg:min-h-[calc(100lvh-241px)] xl:min-h-[calc(100lvh-253px)]">
        {children}
      </div>
    </section>
  );
}
