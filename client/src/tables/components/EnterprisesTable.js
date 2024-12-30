import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './EnterprisesTable.css';

const EnterprisesTable = () => {
    const [data, setData] = useState([]);
    const [editData, setEditData] = useState(null);
    const [newRow, setNewRow] = useState({ enterprise_name: '', location: '' });

    useEffect(() => {
        fetchEnterprises();
    }, []);

    const fetchEnterprises = async () => {
        try {
            const response = await fetch('http://localhost:5000/getEnterprises');
            const result = await response.json();
            if (Array.isArray(result)) {
                setData(result);
            } else {
                console.error('Expected an array but got:', result);
            }
        } catch (error) {
            console.error('Error fetching enterprises:', error);
        }
    };

    const handleAddRow = async () => {
        try {
            const response = await fetch('http://localhost:5000/postEnterprises', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRow),
            });
            const addedEnterprise = await response.json();
            setData([...data, addedEnterprise]);
            setNewRow({ enterprise_name: '', location: '' });
        } catch (error) {
            console.error('Error adding enterprise:', error);
        }
    };

    const handleEditRow = (row) => {
        setEditData(row);
    };

    const handleSaveEdit = async () => {
        try {
            const response = await fetch(`http://localhost:5000/enterprises/${editData._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData),
            });
            const updatedEnterprise = await response.json();
            setData(data.map(row => (row._id === updatedEnterprise._id ? updatedEnterprise : row)));
            setEditData(null);
        } catch (error) {
            console.error('Error saving enterprise:', error);
        }
    };

    const handleDeleteRow = async (id) => {
        try {
            await fetch(`http://localhost:5000/enterprises/${id}`, {
                method: 'DELETE',
            });
            setData(data.filter(row => row._id !== id));
        } catch (error) {
            console.error('Error deleting enterprise:', error);
        }
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4 text-center">Enterprises</h1>
            <div className="table-wrapper d-flex justify-content-center">
                <table className="table table-bordered w-75">
                    <thead className="table-dark">
                    <tr>
                        <th>Enterprise Name</th>
                        <th>Location</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.length > 0 ? (
                        data.map(row => (
                            <tr key={row._id}>
                                <td>
                                    {editData && editData._id === row._id ? (
                                        <input
                                            type="text"
                                            value={editData.enterprise_name}
                                            onChange={(e) => setEditData({ ...editData, enterprise_name: e.target.value })}
                                        />
                                    ) : (
                                        row.enterprise_name
                                    )}
                                </td>
                                <td>
                                    {editData && editData._id === row._id ? (
                                        <input
                                            type="text"
                                            value={editData.location}
                                            onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                                        />
                                    ) : (
                                        row.location
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
                            <td colSpan="3" className="text-center">No enterprises found.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
            <div className="mt-4">
                <h3>Add New Enterprise</h3>
                <div className="form-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Enterprise Name"
                        value={newRow.enterprise_name}
                        onChange={(e) => setNewRow({ ...newRow, enterprise_name: e.target.value })}
                    />
                    <input
                        type="text"
                        className="form-control mt-2"
                        placeholder="Location"
                        value={newRow.location}
                        onChange={(e) => setNewRow({ ...newRow, location: e.target.value })}
                    />
                    <button className="btn btn-primary mt-2" onClick={handleAddRow}>Add Row</button>
                </div>
            </div>
        </div>
    );
};

export default EnterprisesTable;
