import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CompensationCalculationsPage = () => {
    const [records, setRecords] = useState([]);
    const [minSalary, setMinSalary] = useState(7100); // Мінімальна заробітна плата (грн/т)

    // Коефіцієнти для різних забруднюючих речовин
    const pollutantsFactors = {
        "Азот амонійний": { A: 1.0, Kt: 1.0, Kzi: 1.0 },
        "БСК 5": { A: 1.2, Kt: 1.1, Kzi: 1.1 },
        "Завислі речовини": { A: 0.9, Kt: 1.05, Kzi: 1.05 },
        "Нафтопродукти": { A: 1.5, Kt: 1.2, Kzi: 1.2 },
        "Тверді речовини": { A: 1.1, Kt: 1.0, Kzi: 1.0 },
        "Сполуки азоту": { A: 1.3, Kt: 1.1, Kzi: 1.1 },
        "Оксид вуглецю": { A: 0.8, Kt: 1.05, Kzi: 1.05 },
        "НМЛОС": { A: 1.4, Kt: 1.15, Kzi: 1.15 }, // НМЛОС - нелеткі органічні сполуки
        "Метан": { A: 1.0, Kt: 1.0, Kzi: 1.0 },
        "Аміак": { A: 1.6, Kt: 1.2, Kzi: 1.2 },
        "Сірководень": { A: 1.7, Kt: 1.3, Kzi: 1.3 },
        "Діоксид сірки": { A: 1.2, Kt: 1.1, Kzi: 1.1 },
        "Діоксид вуглецю": { A: 0.7, Kt: 1.0, Kzi: 1.0 }
        // Додати інші забруднюючі речовини за необхідності
    };

    // Завантаження записів із сервера
    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const response = await axios.get('http://localhost:5000/getCalc');
                setRecords(response.data);
            } catch (error) {
                console.error('Error fetching records:', error);
            }
        };

        fetchRecords();
    }, []);

    const calculateExcessEmission = (record) => {
        const { pollutant_name, concentration, normConcentration, gasFlowRate, workingTime } = record;

        if (!concentration || !normConcentration || !gasFlowRate || !workingTime) return 0;

        // Розрахунок маси наднормативного викиду за формулою (1)
        const excessEmission = (concentration - normConcentration) * gasFlowRate * workingTime / 1000; // результат у тоннах

        return excessEmission;
    };

    // Функція для розрахунку збитків
    const calculateCompensation = (record) => {
        const { pollutant_name } = record;

        const factors = pollutantsFactors[pollutant_name];
        if (!factors) return 0;

        const excessEmission = calculateExcessEmission(record);

        const compensation = excessEmission * minSalary * 1.1 * factors.A * factors.Kt * factors.Kzi;

        return compensation;
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4 text-center">Розрахунок відшкодування збитків</h1>
            <table className="table table-bordered">
                <thead>
                <tr>
                    <th>№ з/п</th>
                    <th>Назва об'єкту</th>
                    <th>Назва забруднюючої речовини</th>
                    <th>Маса наднормативного викиду (т)</th>
                    <th>Розмір відшкодування (грн)</th>
                </tr>
                </thead>
                <tbody>
                {records.map((record, index) => {
                    const compensation = calculateCompensation(record);
                    const excessEmission = calculateExcessEmission(record);
                    return (
                        <tr key={record._id}>
                            <td>{index + 1}</td>
                            <td>{record.enterprise_name}</td>
                            <td>{record.pollutant_name}</td>
                            <td>{excessEmission.toFixed(2)}</td>
                            <td>{compensation.toFixed(2)}</td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
};

export default CompensationCalculationsPage;
