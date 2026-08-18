const fetch = globalThis.fetch || require('node-fetch');
(async () => {
  const body = {
    fullName: 'UI Test User',
    email: 'ui-test@example.com',
    phone: '+212600111222',
    city: 'Tafraout',
    parcours: 'Trail moyen (25 km)',
    tshirt: 'L',
    amount: 400,
    card: { number: '4242 4242 4242 4242', name: 'UI TEST', exp: '12/30', cvc: '123' }
  };
  try {
    const res = await fetch('http://localhost:8081/api/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    console.log('status', res.status);
    console.log(await res.text());
  } catch (e) {
    console.error('request failed', e && e.message ? e.message : e);
  }
})();
