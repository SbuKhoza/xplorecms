import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layout
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import HomeManager from './pages/HomeManager';
import Restaurants from './pages/Restaurants';
import Accommodation from './pages/Accommodation';
import Recreation from './pages/Recreation';
import Attraction from './pages/Attraction';
import Emergency from './pages/Emergency';
import Transport from './pages/Transport';
import Business from './pages/Business';
import Healthcare from './pages/Healthcare';
import PublicServices from './pages/PublicServices';
import XploreMenu from './pages/XploreMenu';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="homemanager" element={<HomeManager />} />
          <Route path="restaurants" element={<Restaurants />} />
          <Route path="accommodation" element={<Accommodation />} />
          <Route path="recreation" element={<Recreation />} />
          <Route path="attraction" element={<Attraction />} />
          <Route path="emergency" element={<Emergency />} />
          <Route path="transport" element={<Transport />} />
          <Route path="business" element={<Business />} />
          <Route path="healthcare" element={<Healthcare />} />
          <Route path="publicservices" element={<PublicServices />} />
          <Route path="xploremenu" element={<XploreMenu />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
