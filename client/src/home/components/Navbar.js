import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is imported

const Navbar = () => {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container">
                <Link className="navbar-brand" to="/">Eco Monitoring</Link>
                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav mr-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/enterprises">Enterprises</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/pollutants">Pollutants</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/records">Records</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/calculations">Calculations</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/health">Health</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/damagecalculations">Damage Calculations</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
