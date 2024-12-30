const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/environment_data')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error(err));

const pollutantSchema = new mongoose.Schema({
    pollutant_name: String,
    gdk: Number,
});

const enterpriseSchema = new mongoose.Schema({
    enterprise_name: String,
    location: String,
});

const recordSchema = new mongoose.Schema({
    research_year: Number,
    enterprise_name: String,
    pollutant_name: String,
    emission_amount: Number,
    fraction: Number,
});

const healthSchema = new mongoose.Schema({
    research_year: { type: Number, required: true },
    location: { type: String, required: true },
    pollutant_name: { type: String, required: true },
    emission_amount: { type: Number, required: true },
    health_danger_rate: { type: String, required: true },
    relativeRisk: { type: Number, required: true }
});
const damageSchema = new mongoose.Schema({
    enterprise_name: { type: String, required: true },
    type: { type: String, enum: ['Water', 'Air'], required: true },
    pollutant_name: { type: String, required: true },
    emission_mass: { type: Number, required: true },
    damage_cost: { type: Number, required: true },
});



const Pollutant = mongoose.model('Pollutant', pollutantSchema);
const Enterprise = mongoose.model('Enterprise', enterpriseSchema);
const Record = mongoose.model('Record', recordSchema);
const Health = mongoose.model('Health', healthSchema);
const Damage = mongoose.model('Damage', damageSchema);

app.get('/', (req, res) => {
    res.send('Server is up and running!');
});

app.get('/getPollutants', async (req, res) => {
    try {
        const pollutants = await Pollutant.find();
        res.json(pollutants);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.post('/postPollutants', async (req, res) => {
    const { pollutant_name, gdk } = req.body;
    try {
        const pollutant = new Pollutant({ pollutant_name, gdk });
        await pollutant.save();
        res.status(201).json(pollutant);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.put('/editPollutants/:id', async (req, res) => {
    const { id } = req.params;
    const { pollutant_name, gdk } = req.body;
    try {
        const updatedPollutant = await Pollutant.findByIdAndUpdate(id, { pollutant_name, gdk }, { new: true });
        res.json(updatedPollutant);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.delete('/deletePollutants/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await Pollutant.findByIdAndDelete(id);
        res.sendStatus(204);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.get('/getEnterprises', async (req, res) => {
    try {
        const enterprises = await Enterprise.find();
        res.json(enterprises);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.post('/postEnterprises', async (req, res) => {
    const { enterprise_name, location } = req.body;
    try {
        const enterprise = new Enterprise({ enterprise_name, location });
        await enterprise.save();
        res.status(201).json(enterprise);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.get('/getRecords', async (req, res) => {
    try {
        const records = await Record.find();
        res.json(records);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.post('/postRecords', async (req, res) => {
    const { research_year, enterprise_name, pollutant_name, emission_amount, fraction } = req.body;
    try {
        const record = new Record({ research_year, enterprise_name, pollutant_name, emission_amount, fraction });
        await record.save();
        res.status(201).json(record);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.put('/putRecords/:id', async (req, res) => {
    const { id } = req.params;
    const { research_year, enterprise_name, pollutant_name, emission_amount, fraction } = req.body;
    try {
        const record = await Record.findByIdAndUpdate(id, { research_year, enterprise_name, pollutant_name, emission_amount, fraction }, { new: true });
        res.json(record);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.delete('/deleteRecords/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await Record.findByIdAndDelete(id);
        res.sendStatus(204);
    } catch (err) {
        res.status(500).send(err);
    }
});


app.get('/getHealth', async (req, res) => {
    try {
        // Витягуємо всі дані, включаючи relativeRisk
        const healthData = await Health.find();
        res.json(healthData);
    } catch (error) {
        console.error('Error fetching health data:', error);
        res.status(500).json({ error: 'Failed to fetch health data' });
    }
});


const calculateHealthDangerRate = (pollutant_name, emissionValue) => {
    const pollutants = {
        "PM2.5": { C0: 0, beta: 0.004 },
        "NO2": { C0: 20, beta: 0.002 },
        "O3": { C0: 70, beta: 0.003 },
        "Тверді речовини": { C0: 0.15, beta: 0.002 },
        "Сполуки азоту": { C0: 0.1, beta: 0.001 },
        "Оксид вуглецю": { C0: 0.1, beta: 0.0015 },
        "НМЛОС": { C0: 0.5, beta: 0.0025 },
        "Метан": { C0: 0.05, beta: 0.001 },
        "Аміак": { C0: 0.2, beta: 0.003 },
        "Сірководень": { C0: 0.008, beta: 0.002 },
        "Діоксид сірки": { C0: 0.5, beta: 0.002 },
        "Діоксид вуглецю": { C0: 0, beta: 0.0005 },
    };

    const pollutant = pollutants[pollutant_name];
    if (!pollutant) return 'unknown';

    const { C0, beta } = pollutant;
    const relativeRisk = Math.exp(beta * (emissionValue - C0));

    // Категоризація ризику
    if (relativeRisk <= 1.2) {
        return { healthDangerRate: 'low', relativeRisk };
    } else if (relativeRisk <= 2.0) {
        return { healthDangerRate: 'medium', relativeRisk };
    } else {
        return { healthDangerRate: 'high', relativeRisk };
    }
};

// POST маршрут
app.post('/postHealth', async (req, res) => {
    const { research_year, location, pollutant_name, emission_amount } = req.body;

    const emissionValue = parseFloat(emission_amount);
    if (!research_year || isNaN(research_year) || research_year < 1900 || research_year > new Date().getFullYear()) {
        return res.status(400).send('Invalid research year');
    }
    if (!location || typeof location !== 'string') {
        return res.status(400).send('Invalid location');
    }
    if (isNaN(emissionValue) || emissionValue < 0) {
        return res.status(400).send('Invalid emission amount');
    }

    const { healthDangerRate, relativeRisk } = calculateHealthDangerRate(pollutant_name, emissionValue);

    try {
        const healthRecord = new Health({
            research_year,
            location,
            pollutant_name,
            emission_amount: emissionValue,
            health_danger_rate: healthDangerRate,
            relativeRisk,
        });
        await healthRecord.save();
        res.status(201).json(healthRecord);
    } catch (err) {
        res.status(500).send(err);
    }
});

// PUT маршрут
app.put('/updateHealth/:id', async (req, res) => {
    const { id } = req.params;
    const { research_year, location, pollutant_name, emission_amount } = req.body;

    const emissionValue = parseFloat(emission_amount);
    if (!research_year || isNaN(research_year) || research_year < 1900 || research_year > new Date().getFullYear()) {
        return res.status(400).send('Invalid research year');
    }
    if (!location || typeof location !== 'string') {
        return res.status(400).send('Invalid location');
    }
    if (isNaN(emissionValue) || emissionValue < 0) {
        return res.status(400).send('Invalid emission amount');
    }

    const { healthDangerRate, relativeRisk } = calculateHealthDangerRate(pollutant_name, emissionValue);

    try {
        const updatedRecord = await Health.findByIdAndUpdate(
            id,
            {
                research_year,
                location,
                pollutant_name,
                emission_amount: emissionValue,
                health_danger_rate: healthDangerRate,
                relativeRisk,
            },
            { new: true }
        );

        if (!updatedRecord) {
            return res.status(404).send('Record not found');
        }

        res.json(updatedRecord);
    } catch (err) {
        console.error('Error updating health record:', err);
        res.status(500).send(err);
    }
});

// DELETE маршрут
app.delete('/deleteHealth/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedRecord = await Health.findByIdAndDelete(id);
        if (!deletedRecord) {
            return res.status(404).send('Record not found');
        }
        res.json({ message: 'Record deleted successfully' });
    } catch (error) {
        console.error('Error deleting health record:', error);
        res.status(500).json({ message: 'Error deleting health record' });
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});