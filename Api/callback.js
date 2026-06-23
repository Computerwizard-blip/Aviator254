export default async function handler(req, res) {
  if(req.method !== 'POST') return res.status(405).end();
  
  const data = req.body;
  console.log('KashLink callback:', JSON.stringify(data));
  
  if(data.status === 'SUCCESS' || data.status === 'COMPLETED'){
    console.log('PAID:', data.account_reference, 'Amount:', data.amount, 'Phone:', data.phone_number);
  } else {
    console.log('FAILED:', data.account_reference, 'Status:', data.status);
  }
  
  res.status(200).send('OK');
}
