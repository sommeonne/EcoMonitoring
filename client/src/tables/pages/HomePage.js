import React from 'react';
import PollutantsTable from './PollutantsTable'; // Adjust the import path as necessary
import EnterprisesTable from './EnterprisesTable'; // Adjust the import path as necessary
import 'bootstrap/dist/css/bootstrap.min.css';

const HomePage = () => {
    return (
        <div className="container mt-4">
            <h1 className="text-center">Eco Monitoring System</h1>
            <div className="mt-4">
                <h2>Pollutants</h2>
                <PollutantsTable />
            </div>
            <div className="mt-4">
                <h2>Enterprises</h2>
                <EnterprisesTable />
            </div>
        </div>
    );
};

export default HomePage;
