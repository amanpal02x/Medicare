const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');

const invoices = [
    {
        "invoiceNumber": "1232",
        "customerName": "Nimbula",
        "date": "2024-12-30T00:00:00.000Z",
        "totalAmount": 67,
        "totalDiscount": 12,
        "status": "Paid",
        "netTotal": 60,
        "pharmacist": null,
        "createdAt": "2025-06-27T11:20:48.387Z",
        "updatedAt": "2025-06-27T11:20:48.387Z"
    },
    {
        "invoiceNumber": "1231",
        "customerName": "nbvc",
        "date": "2024-12-30T00:00:00.000Z",
        "totalAmount": 67,
        "totalDiscount": 12,
        "status": "Pending",
        "netTotal": 60,
        "pharmacist": null,
        "createdAt": "2025-06-27T08:50:51.224Z",
        "updatedAt": "2025-06-27T10:14:45.525Z"
    }
];

async function importInvoices() {
    try {
        await mongoose.connect('mongodb://localhost:27017/medicare', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        for (const invoice of invoices) {
            // Remove _id and __v if present
            delete invoice._id;
            delete invoice.__v;
            // Set pharmacist to null if not provided
            if (!invoice.pharmacist) invoice.pharmacist = null;
            // Upsert by invoiceNumber
            await Invoice.findOneAndUpdate(
                { invoiceNumber: invoice.invoiceNumber },
                invoice,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }
        console.log('Invoices imported successfully');
    } catch (err) {
        console.error('Error importing invoices:', err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

importInvoices(); 