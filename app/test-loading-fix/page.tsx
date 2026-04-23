"use client";

import { useState } from "react";

export default function TestLoadingFixPage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testAuthFormLoading = () => {
    addResult("Testing AuthForm loading state fix...");
    addResult("Open the regular auth modal and test login/register");
    addResult("Loading state should reset properly after:");
    addResult("- Successful login (before redirect)");
    addResult("- Failed login (error case)");
    addResult("- Successful registration");
    addResult("- Failed registration");
    addResult("- Email confirmation required");
  };

  const testSellerFormLoading = () => {
    addResult("Testing SellerLoginForm loading state fix...");
    addResult("Open seller auth modal and test seller login");
    addResult("Loading state should reset properly after:");
    addResult("- Successful seller login (before redirect)");
    addResult("- Failed seller login");
    addResult("- Email confirmation required");
    addResult("- Non-seller account attempt");
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test Loading State Fixes</h1>
      
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
        <h2 className="font-semibold text-red-800 mb-2">Issue Fixed:</h2>
        <p className="text-sm text-red-700">
          Login forms were getting stuck in loading state because setLoading(false) wasn't called before redirects or in some error cases.
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">What was fixed:</h2>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>1. AuthForm - setLoading(false) added before all redirects</li>
          <li>2. AuthForm - setLoading(false) added in register success/error cases</li>
          <li>3. AuthForm - setLoading(false) added in login error cases</li>
          <li>4. AuthForm - setLoading(false) added in email confirmation case</li>
          <li>5. SellerLoginForm - setLoading(false) added before router.push()</li>
        </ul>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={testAuthFormLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Test Regular Auth Form Loading
        </button>
        
        <button
          onClick={testSellerFormLoading}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
        >
          Test Seller Auth Form Loading
        </button>
        
        <button
          onClick={clearResults}
          className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
        >
          Clear Test Results
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Test Instructions:</h3>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <h3 className="font-semibold mb-2">Verification Checklist:</h3>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>Regular login loading state resets after successful login</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>Regular login loading state resets after failed login</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>Registration loading state resets after success/error</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>Seller login loading state resets before redirect</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>No more stuck loading states</span>
          </label>
        </div>
      </div>
    </div>
  );
}
