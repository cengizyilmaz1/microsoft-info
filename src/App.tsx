import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Applications } from './pages/Applications';
import { Permissions } from './pages/Permissions';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/permissions" element={<Permissions />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;