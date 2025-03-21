const express = require('express');
const cors = require('cors');
require('dotenv').config();
const Airtable = require('airtable');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

// Configure Airtable clearly
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
                .base(process.env.AIRTABLE_BASE_ID);

// Endpoint to fetch records from Airtable
app.get('/api/customer', async (req, res) => {
    const { name, ticket } = req.query;

    if (!name || !ticket) {
        return res.status(400).json({ error: 'Please provide customer name and ticket number.' });
    }

    try {
        const records = await base(process.env.AIRTABLE_TABLE_NAME)
            .select({
                filterByFormula: `AND({Name} = "${name}", {Ticket Number} = "${ticket}")`
            })
            .firstPage();

        if (records.length === 0) {
            return res.status(404).json({ error: 'Customer not found.' });
        }

        const customer = records[0].fields;

        res.json({
            name: customer['Name'],
            ticket: customer['Ticket Number'],
            principal_amount: customer['Redeem Value'],
            interest_due: customer['Total Income'],
            outstanding_balance: customer['Total']
        });

    } catch (error) {
        console.error('Error fetching data from Airtable:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Start your server
app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}`);
});
