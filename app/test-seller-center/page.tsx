"use client";

import { useState } from "react";

export default function TestSellerCenterPage() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testDirectAccess = async () => {
    setLoading(true);
    setResults([]);
    addResult("=== TESTING DIRECT ACCESS TO SELLER CENTER ===");

    try {
      // Test 1: Direct access to seller dashboard
      addResult("1. Testing direct access to /seller/dashboard");
      try {
        const response = await fetch("/seller/dashboard", { method: "HEAD" });
        addResult(`   Status: ${response.status} (${response.ok ? 'Accessible' : 'Redirect/Error'})`);
        
        if (response.redirected) {
          addResult(`   Redirected to: ${response.url}`);
        }
      } catch (error) {
        addResult(`   Error: ${error}`);
      }

      // Test 2: Direct access to seller login
      addResult("2. Testing direct access to /seller/login");
      try {
        const response = await fetch("/seller/login", { method: "HEAD" });
        addResult(`   Status: ${response.status} (${response.ok ? 'Accessible' : 'Redirect/Error'})`);
        
        if (response.redirected) {
          addResult(`   Redirected to: ${response.url}`);
        }
      } catch (error) {
        addResult(`   Error: ${error}`);
      }

      // Test 3: Direct access to seller registration
      addResult("3. Testing direct access to /seller/register");
      try {
        const response = await fetch("/seller/register", { method: "HEAD" });
        addResult(`   Status: ${response.status} (${response.ok ? 'Accessible' : 'Redirect/Error'})`);
        
        if (response.redirected) {
          addResult(`   Redirected to: ${response.url}`);
        }
      } catch (error) {
        addResult(`   Error: ${error}`);
      }

      // Test 4: Compare with buyer dashboard
      addResult("4. Testing access to /account/dashboard (buyer)");
      try {
        const response = await fetch("/account/dashboard", { method: "HEAD" });
        addResult(`   Status: ${response.status} (${response.ok ? 'Accessible' : 'Redirect/Error'})`);
        
        if (response.redirected) {
          addResult(`   Redirected to: ${response.url}`);
        }
      } catch (error) {
        addResult(`   Error: ${error}`);
      }

      addResult("=== ANALYSIS ===");
      addResult("If seller dashboard redirects to login:");
      addResult("- User is not logged in OR not a seller");
      addResult("- Need to login first");
      addResult("");
      addResult("If seller dashboard is accessible:");
      addResult("- Seller center exists and works");
      addResult("- Issue is with login redirect flow");
      addResult("");
      addResult("If buyer dashboard is accessible but seller is not:");
      addResult("- User is logged in but not a seller");
      addResult("- Check user role in database");

    } catch (error) {
      addResult(`Test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testCurrentPage = () => {
    setLoading(true);
    setResults([]);
    addResult("=== CURRENT PAGE ANALYSIS ===");

    addResult(`Current URL: ${window.location.href}`);
    addResult(`Current Path: ${window.location.pathname}`);
    addResult(`Current Host: ${window.location.host}`);
    
    // Check if we're on a seller page
    const isSellerPage = window.location.pathname.startsWith("/seller/");
    const isAccountPage = window.location.pathname.startsWith("/account/");
    const isAuthPage = window.location.pathname.startsWith("/auth/");
    
    addResult(`Page Type: ${isSellerPage ? 'Seller' : isAccountPage ? 'Account' : isAuthPage ? 'Auth' : 'Other'}`);
    
    // Check page title
    addResult(`Page Title: ${document.title}`);
    
    // Check for any error messages on the page
    const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"]');
    if (errorElements.length > 0) {
      addResult(`Found ${errorElements.length} potential error elements`);
      errorElements.forEach((el, index) => {
        addResult(`   Error ${index + 1}: ${el.textContent?.trim()}`);
      });
    } else {
      addResult("No obvious error elements found");
    }

    // Check for loading indicators
    const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"]');
    if (loadingElements.length > 0) {
      addResult(`Found ${loadingElements.length} loading elements`);
    } else {
      addResult("No loading elements found");
    }

    addResult("=== RECOMMENDATIONS ===");
    if (isSellerPage) {
      addResult("You're on a seller page - this is good!");
      addResult("If you see issues here, the problem is with the page itself");
    } else if (isAccountPage) {
      addResult("You're on the buyer dashboard");
      addResult("This means login worked but redirect failed");
      addResult("Check console for 'AuthForm: User role check' logs");
    } else if (isAuthPage) {
      addResult("You're on an authentication page");
      addResult("Login process might be stuck here");
    } else {
      addResult("You're on another page");
      addResult("Try navigating to seller pages directly");
    }

    setLoading(false);
  };

  const checkConsoleErrors = () => {
    setLoading(true);
    setResults([]);
    addResult("=== CONSOLE ERROR CHECK ===");

    addResult("Please check your browser console (F12) for:");
    addResult("1. Navigation throttling warnings");
    addResult("2. 'AuthForm: User role check' messages");
    addResult("3. Any JavaScript errors");
    addResult("4. Network request failures");
    addResult("");
    addResult("Look specifically for:");
    addResult('- "AuthForm: User role check - Role: seller"');
    addResult('- "Throttling navigation" warnings');
    addResult('- "Failed to fetch" errors');
    addResult('- Any red error messages');
    addResult("");
    addResult("Report what you see in the console!");

    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test Seller Center</h1>
      
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">What to Check:</h2>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>1. Can you access seller dashboard directly?</li>
          <li>2. What page are you currently on?</li>
          <li>3. Are there console errors?</li>
          <li>4. What happens when you try to login?</li>
        </ul>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={testDirectAccess}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Direct Access to Seller Center"}
        </button>
        
        <button
          onClick={testCurrentPage}
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          Analyze Current Page
        </button>
        
        <button
          onClick={checkConsoleErrors}
          disabled={loading}
          className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
        >
          Check Console Errors
        </button>
        
        <button
          onClick={clearResults}
          className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
        >
          Clear Results
        </button>
      </div>

      {results.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div 
                key={index} 
                className={`text-sm font-mono p-2 rounded ${
                  result.includes("ERROR") 
                    ? "bg-red-50 text-red-700" 
                    : result.includes("===")
                    ? "bg-gray-100 font-bold"
                    : result.includes("Status:")
                    ? "bg-blue-50 text-blue-700"
                    : "bg-gray-50"
                }`}
              >
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2">Manual Testing Steps:</h3>
        <ol className="text-sm space-y-1">
          <li>1. Open new tab and go to <code className="bg-gray-100 px-1 rounded">http://localhost:3000/seller/dashboard</code></li>
          <li>2. Note what happens (loads, redirects, error)</li>
          <li>3. Try <code className="bg-gray-100 px-1 rounded">http://localhost:3000/seller/login</code></li>
          <li>4. Try logging in with chinaplusgroup@gmail.com</li>
          <li>5. Check browser console (F12) for any errors</li>
        </ol>
      </div>
    </div>
  );
}
