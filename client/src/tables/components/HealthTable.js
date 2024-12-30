import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './HealthTable.css';

const pollutants = {
    "PM2.5": { C0: 0, beta: 0.004 },
    "NO2": { C0: 20, beta: 0.002 },
    "O3": { C0: 70, beta: 0.003 },
    "Тверді речовини": { C0: 0.15, beta: 0.002 },
    "Сполуки азоту": { C0: 0.05, beta: 0.0015 },
    "Оксид вуглецю": { C0: 6, beta: 0.004 },
    "НМЛОС": { C0: 0.5, beta: 0.0025 },
    "Метан": { C0: 1.0, beta: 0.0005 },
    "Аміак": { C0: 0.2, beta: 0.003 },
    "Сірководень": { C0: 0.01, beta: 0.004 },
    "Діоксид сірки": { C0: 0.5, beta: 0.002 },
    "Діоксид вуглецю": { C0: 0.4, beta: 0.001 },
};

const HealthTable = () => {
    const [healthData, setHealthData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [sortDirection, setSortDirection] = useState('asc');
    const [searchLocation, setSearchLocation] = useState('');
    const [searchPollutant, setSearchPollutant] = useState('');
    const [newRecord, setNewRecord] = useState({
        research_year: '',
        location: '',
        pollutant_name: '',
        emission_amount: '',
    });
    const [editRecord, setEditRecord] = useState(null);

    useEffect(() => {
        const fetchHealthData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/getHealth');
                setHealthData(response.data);
                setFilteredData(response.data);
            } catch (error) {
                console.error('Error fetching health data:', error);
            }
        };

        fetchHealthData();
    }, []);

    useEffect(() => {
        const filterData = () => {
            const lowerCaseLocation = searchLocation.toLowerCase();
            const lowerCasePollutant = searchPollutant.toLowerCase();

            const filtered = healthData.filter((record) => {
                const locationMatch = record.location.toLowerCase().includes(lowerCaseLocation);
                const pollutantMatch = record.pollutant_name.toLowerCase().includes(lowerCasePollutant);
                return locationMatch && pollutantMatch;
            });

            setFilteredData(filtered);
        };

        filterData();
    }, [searchLocation, searchPollutant, healthData]);

    const sortData = () => {
        const direction = sortDirection === 'asc' ? 'desc' : 'asc';
        const sortedData = [...filteredData].sort((a, b) => {
            if (a.research_year < b.research_year) return direction === 'asc' ? -1 : 1;
            if (a.research_year > b.research_year) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        setSortDirection(direction);
        setFilteredData(sortedData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (editRecord) {
            setEditRecord((prevRecord) => ({
                ...prevRecord,
                [name]: value,
            }));
        } else {
            setNewRecord((prevRecord) => ({
                ...prevRecord,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:5000/postHealth', newRecord);
            setHealthData([...healthData, response.data]);
            setNewRecord({
                research_year: '',
                location: '',
                pollutant_name: '',
                emission_amount: '',
            });
        } catch (error) {
            console.error('Error adding health record:', error);
        }
    };

    const handleEdit = (record) => {
        setEditRecord(record);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.put(`http://localhost:5000/updateHealth/${editRecord._id}`, editRecord);
            const updatedData = healthData.map((item) =>
                item._id === response.data._id ? response.data : item
            );
            setHealthData(updatedData);
            setFilteredData(updatedData);
            setEditRecord(null);
        } catch (error) {
            console.error('Error updating health record:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/deleteHealth/${id}`);
            const updatedData = healthData.filter((record) => record._id !== id);
            setHealthData(updatedData);
            setFilteredData(updatedData);
        } catch (error) {
            console.error('Error deleting health record:', error);
        }
    };

    return (
        <div className="health-container">
            <h2>Health Data Table</h2>

            {/* Форма для додавання нового запису */}
            <form onSubmit={handleSubmit} className="health-form">
                <div className="form-field">
                    <label>Research Year:</label>
                    <input
                        type="number"
                        name="research_year"
                        value={newRecord.research_year}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-field">
                    <label>Location:</label>
                    <input
                        type="text"
                        name="location"
                        value={newRecord.location}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-field">
                    <label>Pollutant Name:</label>
                    <input
                        type="text"
                        name="pollutant_name"
                        value={newRecord.pollutant_name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-field">
                    <label>Emission Amount (µg/m³):</label>
                    <input
                        type="number"
                        name="emission_amount"
                        value={newRecord.emission_amount}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="submit-btn">Add Record</button>
            </form>

            {/* Пошук */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search by Location"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Search by Pollutant Name"
                    value={searchPollutant}
                    onChange={(e) => setSearchPollutant(e.target.value)}
                />
            </div>

            <table className="health-table">
                <thead>
                <tr>
                    <th onClick={sortData}>
                        Research Year {sortDirection === 'asc' ? '↑' : '↓'}
                    </th>
                    <th>Location</th>
                    <th>Pollutant Name</th>
                    <th>Emission Amount (µg/m³)</th>
                    <th>Health Danger Rate</th>
                    <th>Relative Risk</th>
                    {/* Added column header */}
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {filteredData.map((record, index) => (
                    <tr key={index}>
                        <td>{record.research_year}</td>
                        <td>{record.location}</td>
                        <td>{record.pollutant_name}</td>
                        <td>{record.emission_amount}</td>
                        <td>{record.health_danger_rate}</td>
                        <td>{record.relativeRisk !== undefined ? record.relativeRisk : 'N/A'}</td>
                        {/* Check for relativeRisk */}
                        <td>
                            <button onClick={() => handleEdit(record)} className="submit-btn">
                                Edit
                            </button>
                            <button onClick={() => handleDelete(record._id)} className="submit-btn">
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>


            {/* Форма для редагування запису */}
            {editRecord && (
                <form onSubmit={handleUpdate} className="health-form">
                    <h3>Edit Record</h3>
                    <div className="form-field">
                        <label>Research Year:</label>
                        <input
                            type="number"
                            name="research_year"
                            value={editRecord.research_year}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-field">
                        <label>Location:</label>
                        <input
                            type="text"
                            name="location"
                            value={editRecord.location}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-field">
                        <label>Pollutant Name:</label>
                        <input
                            type="text"
                            name="pollutant_name"
                            value={editRecord.pollutant_name}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-field">
                        <label>Emission Amount (µg/m³):</label>
                        <input
                            type="number"
                            name="emission_amount"
                            value={editRecord.emission_amount}
                            onChange={handleChange}
                        />
                    </div>
                    <button type="submit" className="submit-btn">Update Record</button>
                </form>
            )}
        </div>
    );
};

export default HealthTable;
