import React, { useState } from 'react'
import AdminSidebar from '../../components/adminDashboard/Sidebar'
import Overview from '../../components/adminDashboard/Overview'
import Users from '../../components/adminDashboard/Users'
import WorkoutOverview from '../../components/adminDashboard/WorkoutOverview'
import PlansManagement from '../../components/adminDashboard/PlansManagement'
import PlansRevenue from '../../components/adminDashboard/PlansRevenue'

const adminDashboard = () => {
  const [activePage, setActivePage] = useState('overview');

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <Overview />;
      case 'users':
        return <Users />;
      case 'workouts':
        return <WorkoutOverview />;  
      case 'plans':
        return <PlansManagement />; 
      case 'plans-revenue':
        return <PlansRevenue />;     
      default:
        return <Overview />;
    }
  };

  return (
    <>
    
      <AdminSidebar onPageChange={setActivePage} />
     
        {renderPage()}
     
   
    </>
  )
}

export default adminDashboard
