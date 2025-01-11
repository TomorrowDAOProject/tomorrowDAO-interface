// import { Typography, FontWeightEnum } from 'aelf-design';

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="tmrwdao-grid z-0">
      <div className="col-12">{children}</div>
    </section>
  );
}
