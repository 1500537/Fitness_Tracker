// Simple API test script
async function testAPI() {
    try {
        console.log('🔄 Testing API connection...');
        
        const response = await fetch('http://localhost:3000/api/plans');
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 API Response:', data);
        
        if (data.success) {
            console.log(`✅ API working! Found ${data.plans.length} plans`);
        } else {
            console.log('❌ API returned error:', data.message);
        }
        
    } catch (error) {
        console.error('❌ API test failed:', error.message);
        console.log('💡 Make sure server is running on port 3000');
    }
}

testAPI();