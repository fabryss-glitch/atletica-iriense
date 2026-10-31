import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Lanes from '@/components/Lanes';

export default function SitoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page">
      <Lanes />
      <Header />
      <div className="page-body">{children}</div>
      <Footer />
    </div>
  );
}
