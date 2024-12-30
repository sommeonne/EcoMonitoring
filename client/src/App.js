// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import EnterprisesPage from './tables/pages/EnterprisePage';
import PollutantsPage from './tables/pages/PollutantsPage';
import HealthPage from './tables/pages/HealthPage'; // Use HealthPage instead of HealthTable
import RecordsPage from './tables/pages/RecordsPage';
import CalculationsPage from './tables/pages/CalculationsPage';
import Navbar from './home/components/Navbar';

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/enterprises" element={<EnterprisesPage />} />
                <Route path="/pollutants" element={<PollutantsPage />} />
                <Route path="/records" element={<RecordsPage />} />
                <Route path="/calculations" element={<CalculationsPage />} />
                <Route path="/health" element={<HealthPage />} />

            </Routes>
        </Router>
    );
}

export default App;
