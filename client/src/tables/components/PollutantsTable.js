import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import './PollutantsTable.css';

const PollutantsTable = () => {
    const [data, setData] = useState([]);
    const [editData, setEditData] = useState(null);
    const [newRow, setNewRow] = useState({ pollutant_name: '', gdk: '' });

    useEffect(() => {
        fetchPollutants();
    }, []);

    const fetchPollutants = async () => {
        try {
            const response = await axios.get('http://localhost:5000/getPollutants');
            setData(response.data);
        } catch (error) {
            console.error('Error fetching pollutants:', error);
        }
    };

    const handleAddRow = async () => {
        if (!newRow.pollutant_name || !newRow.gdk) {
            alert('Please fill in all fields!');
            return;
        }
        try {
            const response = await axios.post('http://localhost:5000/postPollutants', newRow);
            setData([...data, response.data]);
            setNewRow({ pollutant_name: '', gdk: '' });
        } catch (error) {
            console.error('Error adding pollutant:', error);
        }
    };

    const handleSaveEdit = async () => {
        if (!editData.pollutant_name || !editData.gdk) {
            alert('Please fill in all fields!');
            return;
        }
        try {
            const response = await axios.put(`http://localhost:5000/editPollutants/${editData._id}`, editData); // Додано ``
            setData(data.map(row => (row._id === response.data._id ? response.data : row)));
            setEditData(null);
        } catch (error) {
            console.error('Error saving pollutant:', error);
        }
    };

    const handleDeleteRow = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/deletePollutants/${id}`); // Додано ``
            setData(data.filter(row => row._id !== id));
        } catch (error) {
            console.error('Error deleting pollutant:', error);
        }
    };

    const handleEditRow = (row) => {
        setEditData(row);
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4 text-center">Pollutants</h1>
            <div className="table-wrapper d-flex justify-content-center">
                <table className="table table-bordered w-75">
                    <thead className="table-dark">
                    <tr>
                        <th>Pollutant Name</th>
                        <th>GDK</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {Array.isArray(data) && data.length > 0 ? (
                        data.map(row => (
                            <tr key={row._id}>
                                <td>
                                    {editData && editData._id === row._id ? (
                                        <input
                                            type="text"
                                            value={editData.pollutant_name}
                                            onChange={(e) => setEditData({ ...editData, pollutant_name: e.target.value })}
                                            className="form-control"
                                        />
                                    ) : (
                                        row.pollutant_name
                                    )}
                                </td>
                                <td>
                                    {editData && editData._id === row._id ? (
                                        <input
                                            type="text"
                                            value={editData.gdk}
                                            onChange={(e) => setEditData({ ...editData, gdk: e.target.value })}
                                            className="form-control"
                                        />
                                    ) : (
                                        row.gdk
                                    )}
                                </td>
                                <td>
                                    {editData && editData._id === row._id ? (
                                        <>
                                            <button className="btn btn-success btn-sm" onClick={handleSaveEdit}>Save</button>
                                            <button className="btn btn-secondary btn-sm" onClick={() => setEditData(null)}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="btn btn-primary btn-sm" onClick={() => handleEditRow(row)}>Edit</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteRow(row._id)}>Delete</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" className="text-center">No pollutants found.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
            <div className="mt-4">
                <h3>Add New Pollutant</h3>
                <div className="form-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Pollutant Name"
                        value={newRow.pollutant_name}
                        onChange={(e) => setNewRow({ ...newRow, pollutant_name: e.target.value })}
                    />
                    <input
                        type="text"
                        className="form-control mt-2"
                        placeholder="GDK"
                        value={newRow.gdk}
                        onChange={(e) => setNewRow({ ...newRow, gdk: e.target.value })}
                    />
                    <button className="btn btn-primary mt-2" onClick={handleAddRow}>Add Pollutant</button>
                </div>
            </div>
        </div>
    );
};

export default PollutantsTable;
