// Test script to seed plans and verify API connection
const testAPI = async () => {
  const baseURL = 'http://localhost:3000/api';
  
  try {
    // 1. Seed plans
    console.log('🌱 Seeding plans...');
    const seedResponse = await fetch(`${baseURL}/plans/seed`, {
      method: 'POST'
    });
    const seedResult = await seedResponse.json();
    console.log('Seed result:', seedResult);
    
    // 2. Get all plans
    console.log('\n📋 Fetching all plans...');
    const getResponse = await fetch(`${baseURL}/plans`);
    const getResult = await getResponse.json();
    console.log('Plans:', getResult);
    
    // 3. Create a new plan
    console.log('\n➕ Creating new plan...');
    const createResponse = await fetch(`${baseURL}/plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Plan',
        monthlyPrice: 19,
        annualPrice: 15,
        tagline: 'Test Tagline',
        popular: false,
        features: ['Test Feature 1', 'Test Feature 2'],
        tier: 'starter'
      })
    });
    const createResult = await createResponse.json();
    console.log('Created plan:', createResult);
    
    console.log('\n✅ API connection successful!');
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
};

testAPI();