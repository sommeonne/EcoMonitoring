import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import './RecordsTable.css'; // Import custom CSS for additional styling

const RecordsTable = () => {
    const [data, setData] = useState([]);
    const [editData, setEditData] = useState(null);
    const [newRow, setNewRow] = useState({ research_year: '', enterprise_name: '', pollutant_name: '', emission_amount: '', fraction: '' });
    const [sortField, setSortField] = useState('research_year');
    const [sortOrder, setSortOrder] = useState('asc');
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch data from server
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/getRecords');
                setData(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleAddRow = async () => {
        if (Object.values(newRow).some(field => !field)) {
            alert('Please fill in all fields!');
            return;
        }
        try {
            const response = await axios.post('http://localhost:5000/postRecords', newRow);
            setData([...data, response.data]);
            setNewRow({ research_year: '', enterprise_name: '', pollutant_name: '', emission_amount: '', fraction: '' });
        } catch (error) {
            console.error('Error adding record:', error);
        }
    };

    const handleEditRow = (row) => setEditData({ ...row });

    const handleSaveEdit = async () => {
        if (Object.values(editData).some(field => !field)) {
            alert('Please fill in all fields!');
            return;
        }
        try {
            await axios.put(`http://localhost:5000/putRecords/${editData._id}`, editData);
            setData(data.map(row => (row._id === editData._id ? editData : row)));
            setEditData(null);
        } catch (error) {
            console.error('Error saving edit:', error);
        }
    };

    const handleDeleteRow = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/deleteRecords/${id}`);
            setData(data.filter(row => row._id !== id));
        } catch (error) {
            console.error('Error deleting record:', error);
        }
    };

    const handleChangeNewRow = (field, value) => {
        setNewRow({ ...newRow, [field]: value });
    };

    const handleChangeEdit = (field, value) => {
        setEditData({ ...editData, [field]: value });
    };

    const sortedData = [...data].sort((a, b) => {
        if (sortField === 'research_year' || sortField === 'emission_amount' || sortField === 'fraction') {
            return sortOrder === 'asc' ? a[sortField] - b[sortField] : b[sortField] - a[sortField];
        } else {
            return sortOrder === 'asc' ? a[sortField].localeCompare(b[sortField]) : b[sortField].localeCompare(a[sortField]);
        }
    });

    const filteredData = sortedData.filter(row =>
        row.enterprise_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.research_year.toString().includes(searchTerm)
    );

    return (
        <div className="container mt-4">
            <h1 className="mb-4 text-center">Records</h1>

            {/* Search Bar */}
            <div className="form-group mb-4">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search by Enterprise Name or Research Year"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Sorting Options */}
            <div className="d-flex justify-content-between mb-4">
                <div className="input-group">
                    <span className="input-group-text">Sort by:</span>
                    <select className="form-select" value={sortField} onChange={(e) => setSortField(e.target.value)}>
                        <option value="research_year">Research Year</option>
                        <option value="enterprise_name">Enterprise Name</option>
                        <option value="pollutant_name">Pollutant Name</option>
                        <option value="emission_amount">Emission Amount</option>
                        <option value="fraction">Fraction</option>
                    </select>
                </div>
                <div className="input-group">
                    <span className="input-group-text">Order:</span>
                    <select className="form-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-striped table-hover">
                    <thead className="table-dark">
                    <tr>
                        <th>Research Year</th>
                        <th>Enterprise Name</th>
                        <th>Pollutant Name</th>
                        <th>Emission Amount</th>
                        <th>Fraction</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredData.map(row => (
                        <tr key={row._id}>
                            {editData && editData._id === row._id ? (
                                <>
                                    <td><input type="text" value={editData.research_year} onChange={(e) => handleChangeEdit('research_year', e.target.value)} /></td>
                                    <td><input type="text" value={editData.enterprise_name} onChange={(e) => handleChangeEdit('enterprise_name', e.target.value)} /></td>
                                    <td><input type="text" value={editData.pollutant_name} onChange={(e) => handleChangeEdit('pollutant_name', e.target.value)} /></td>
                                    <td><input type="text" value={editData.emission_amount} onChange={(e) => handleChangeEdit('emission_amount', e.target.value)} /></td>
                                    <td><input type="text" value={editData.fraction} onChange={(e) => handleChangeEdit('fraction', e.target.value)} /></td>
                                    <td>
                                        <button className="btn btn-success btn-sm" onClick={handleSaveEdit}>Save</button>
                                        <button className="btn btn-secondary btn-sm" onClick={() => setEditData(null)}>Cancel</button>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td>{row.research_year}</td>
                                    <td>{row.enterprise_name}</td>
                                    <td>{row.pollutant_name}</td>
                                    <td>{row.emission_amount}</td>
                                    <td>{row.fraction}</td>
                                    <td>
                                        <button className="btn btn-primary btn-sm" onClick={() => handleEditRow(row)}>Edit</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteRow(row._id)}>Delete</button>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4">
                <h3>Add New Row</h3>
                <div className="form-group">
                    <input type="text" className="form-control mt-2" placeholder="Research Year" value={newRow.research_year} onChange={(e) => handleChangeNewRow('research_year', e.target.value)} />
                    <input type="text" className="form-control mt-2" placeholder="Enterprise Name" value={newRow.enterprise_name} onChange={(e) => handleChangeNewRow('enterprise_name', e.target.value)} />
                    <input type="text" className="form-control mt-2" placeholder="Pollutant Name" value={newRow.pollutant_name} onChange={(e) => handleChangeNewRow('pollutant_name', e.target.value)} />
                    <input type="text" className="form-control mt-2" placeholder="Emission Amount" value={newRow.emission_amount} onChange={(e) => handleChangeNewRow('emission_amount', e.target.value)} />
                    <input type="text" className="form-control mt-2" placeholder="Fraction" value={newRow.fraction} onChange={(e) => handleChangeNewRow('fraction', e.target.value)} />
                </div>
                <button className="btn btn-success" onClick={handleAddRow}>Add Row</button>
            </div>
        </div>
    );
};

export default RecordsTable;
