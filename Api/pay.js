export default async function handler(req, res) {
  if(req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});
  
  const {phone, amount} = req.body;
  const secret = process.env.KASHLINK_SECRET;
  
  if(!secret) return res.status(500).json({error: 'API key not configured'});
  if(!phone || !amount) return res.status(400).json({error: 'Phone and amount required'});
  if(!phone.startsWith('2547') || phone.length !== 12) {
    return res.status(400).json({error: 'Phone must be 2547XXXXXXXX format'});
  }

  const order_id = 'ORDER_' + Date.now();
  const callback_url = `https://${req.headers.host}/api/callback`;

  try {
    const response = await fetch('https://api.kash-link.com/v1/transactions/stkpush', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secret}`
      },
      body: JSON.stringify({
        amount: amount,
        phone_number: phone,
        account_reference: order_id,
        description: 'Portfolio Payment',
        callback_url: callback_url
      })
    });
    
    const data = await response.json();
    res.status(200).json(data);
  } catch(err) {
    res.status(500).json({error: 'Failed to initiate payment'});
  }
}
