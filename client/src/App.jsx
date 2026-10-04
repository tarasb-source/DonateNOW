import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Donate from './pages/Donate.jsx';
import Volunteering from './pages/Volunteering.jsx';
import Contact from './pages/Contact.jsx';
import About from './pages/About.jsx';
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from './components/ScrollToTop.jsx';

function App() {

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex flex-1 flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/volunteering" element={<Volunteering />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
