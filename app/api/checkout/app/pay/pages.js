// /app/pay/page.js
'use client';
import { useState } from 'react';

export default function PayPage() {
  const [loading, setLoading] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target);
    const data = {
      phone: formData.get('phone'),
      amount: formData.get('amount'),
      name: formData.get('name'),
      email: formData.get('email')
    };

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    
    if (result.success) {
      // Step 3: Redirect to Kashlink checkout page
      window.location.href = result.checkout_url;
    } else {
      alert('Error: ' + JSON.stringify(result.error));
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePay}>
      <input name="name" placeholder="Full Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="phone" placeholder="2547XXXXXXXX" required />
      <input name="amount" type="number" placeholder="Amount" defaultValue="10" required />
      <button disabled={loading}>{loading ? 'Redirecting...' : 'Pay Now'}</button>
    </form>
  );
}
