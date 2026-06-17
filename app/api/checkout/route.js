// /app/api/checkout/route.js
export async function POST(request) {
  try {
    const body = await request.json();
    const { phone, amount, email, name } = body;
    
    const api_key = process.env.KASHLINK_API_KEY;
    const url = 'https://yoobntuwzcdacvylves.supabase.co/functions/v1/api-checkout-initialize';

    // Format phone to +2547XXXXXXXX
    const formattedPhone = phone.startsWith('+254') 
      ? phone 
      : '+254' + phone.replace(/^0/, '');

    const payload = {
      amount: Number(amount),
      currency: 'KES',
      customer: {
        email: email || 'noemail@example.com',
        name: name || 'Customer',
        phone: formattedPhone
      },
      product_name: 'Order Payment',
      reference_id: 'ORD-' + Date.now(),
      redirect_url: `${request.headers.get('origin')}/success`
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.status === 'success') {
      return Response.json({ 
        success: true, 
        checkout_url: data.data.checkout_url 
      });
    } else {
      return Response.json({ success: false, error: data }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
