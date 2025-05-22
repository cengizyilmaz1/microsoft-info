import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Applications } from './pages/Applications';
import { Permissions } from './pages/Permissions';
import { ApplicationDetail } from './pages/ApplicationDetail';
import { PermissionDetail } from './pages/PermissionDetail';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/applications/:id" element={<ApplicationDetail />} />
          <Route path="/permissions" element={<Permissions />} />
          <Route path="/permissions/:type/:id" element={<PermissionDetail />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;