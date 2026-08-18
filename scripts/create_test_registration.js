const fs = require('fs');
const path = require('path');

async function run() {
  const base = process.cwd();
  const csvPath = path.join(base, 'registrations.csv');
  const xlsxPath = path.join(base, 'registrations.xlsx');

  const headers = [
    'date',
    'fullName',
    'email',
    'phone',
    'city',
    'parcours',
    'tshirt',
    'amount',
    'paymentRef',
  ];

  const sample = {
    fullName: 'Test User',
    email: 'test@example.com',
    phone: '+212600000000',
    city: 'Tafraout',
    parcours: 'Trail moyen (25 km)',
    tshirt: 'M',
    amount: 400,
    paymentRef: 'MOCK-TEST',
  };

  const row = [new Date().toISOString(), sample.fullName, sample.email, sample.phone, sample.city, sample.parcours, sample.tshirt, sample.amount, sample.paymentRef]
    .map((v) => `"${String(v).replace(/"/g, '""')}"`)
    .join(',');

  if (!fs.existsSync(csvPath)) {
    fs.writeFileSync(csvPath, headers.join(',') + '\n' + row + '\n', 'utf8');
    console.log('Created', csvPath);
  } else {
    fs.appendFileSync(csvPath, row + '\n', 'utf8');
    console.log('Appended to', csvPath);
  }

  // Try XLSX using exceljs if available
  try {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    if (fs.existsSync(xlsxPath)) {
      await workbook.xlsx.readFile(xlsxPath);
    }
    const sheet = workbook.getWorksheet('Registrations') ?? workbook.addWorksheet('Registrations');
    if (sheet.rowCount === 0) sheet.addRow(headers);
    sheet.addRow([new Date().toISOString(), sample.fullName, sample.email, sample.phone, sample.city, sample.parcours, sample.tshirt, sample.amount, sample.paymentRef]);
    await workbook.xlsx.writeFile(xlsxPath);
    console.log('Wrote', xlsxPath);
  } catch (err) {
    console.warn('exceljs not available or failed to write XLSX:', err && err.message ? err.message : err);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
