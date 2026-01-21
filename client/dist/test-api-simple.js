// Simple test to check if the server is running and API endpoints are accessible
const testAPI = async () => {
  const API_BASE = 'http://localhost:3000/api';
  
  console.log('Testing API endpoints...');
  
  try {
    // Test basic server health
    const healthResponse = await fetch('http://localhost:3000/');
    const healthText = await healthResponse.text();
    console.log('Server health:', healthText);
    
    // Test plans endpoint (without auth for now)
    const plansResponse = await fetch(`${API_BASE}/plans`);
    console.log('Plans endpoint status:', plansResponse.status);
    
    if (plansResponse.status === 401) {
      console.log('✓ Plans endpoint requires authentication (expected)');
    } else {
      const plansData = await plansResponse.json();
      console.log('Plans response:', plansData);
    }
    
  } catch (error) {
    console.error('API test failed:', error);
  }
};

// Run the test
testAPI();