export default async function handler(req, res) {
  if(req.method !== 'POST') return res.status(405).end();
  
  const data = req.body;
  console.log('KashLink callback received:', JSON.stringify(data));
  
  // Save payment record - replace this with Google Sheets/Database later
  if(data.status === 'SUCCESS' || data.status === 'COMPLETED'){
    console.log('✅ PAID:', data.account_reference, 'Amount:', data.amount, 'Phone:', data.phone_number);
    // TODO: Save to Google Sheets here for KNEC records
  } else {
    console.log('❌ FAILED:', data.account_reference, 'Status:', data.status);
  }
  
  // Must return 200 so KashLink knows we received it
  res.status(200).send('OK');
}
