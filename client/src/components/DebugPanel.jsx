import React from 'react';
import { useAppContext } from '../context/useAppContext';

const DebugPanel = () => {
  const context = useAppContext();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  const contextKeys = Object.keys(context);
  const plansFunctions = contextKeys.filter(key => key.includes('Plan') || key.includes('plan'));
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2">Debug Panel</h4>
      <div className="space-y-1">
        <div>Context Keys: {contextKeys.length}</div>
        <div>Plans Functions: {plansFunctions.join(', ')}</div>
        <div>fetchPlans: {typeof context.fetchPlans}</div>
        <div>createPlan: {typeof context.createPlan}</div>
        <div>updatePlan: {typeof context.updatePlan}</div>
        <div>deletePlan: {typeof context.deletePlan}</div>
        <div>togglePlanPopular: {typeof context.togglePlanPopular}</div>
        <div>Plans Array: {Array.isArray(context.plans) ? context.plans.length : 'Not array'}</div>
        <div>Plans Loading: {String(context.plansLoading)}</div>
        <div>Error: {context.error || 'None'}</div>
        <button 
          onClick={() => context.setBanAlert({
            message: 'Your account has been suspended',
            reason: 'Violation of community guidelines'
          })}
          className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs mt-2"
        >
          Test Ban Alert
        </button>
      </div>
    </div>
  );
};

export default DebugPanel;