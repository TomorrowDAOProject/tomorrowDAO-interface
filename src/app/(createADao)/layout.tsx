// import { Typography, FontWeightEnum } from 'aelf-design';

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="tmrwdao-grid sm:max-w-[568px] md:max-w-[830px] lg:max-w-[1051px] lg:!px-[3.75rem] z-0">
      <div className="col-12">{children}</div>
    </section>
  );
}
