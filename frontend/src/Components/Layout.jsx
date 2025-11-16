import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <Outlet /> {/* This is where nested route pages will render */}
      </main>
      <Footer />
    </>
  );
};

export default Layout;


