import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Donate from './pages/Donate.jsx';
import DonateThankYou from './pages/DonateThankYou.jsx';
import Volunteering from './pages/Volunteering.jsx';
import Contact from './pages/Contact.jsx';
import About from './pages/About.jsx';
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from './components/ScrollToTop.jsx';

// Loaded on demand so the map library doesn't slow down the other pages.
const Events = lazy(() => import('./pages/Events.jsx'));

function App() {

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex flex-1 flex-col">
        <Suspense fallback={<p className="p-8 text-center">Loading...</p>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/donate/thank-you" element={<DonateThankYou />} />
          <Route path="/volunteering" element={<Volunteering />} />
          <Route path="/events" element={<Events />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

export default App
