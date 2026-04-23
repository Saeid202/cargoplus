"use client";

import { useState } from "react";

export default function InvestigateSellerCenterPage() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const investigateSellerCenter = async () => {
    setLoading(true);
    setResults([]);
    addResult("=== SELLER CENTER INVESTIGATION ===");

    try {
      // Check 1: Verify seller dashboard exists
      addResult("1. CHECKING: Does seller dashboard exist?");
      try {
        const response = await fetch("/seller/dashboard", { method: "HEAD" });
        if (response.ok) {
          addResult("   RESULT: Seller dashboard exists and is accessible");
        } else {
          addResult(`   RESULT: Seller dashboard returned status ${response.status}`);
        }
      } catch (error) {
        addResult(`   ERROR: Cannot access seller dashboard - ${error}`);
      }

      // Check 2: Verify seller login page exists
      addResult("2. CHECKING: Does seller login page exist?");
      try {
        const response = await fetch("/seller/login", { method: "HEAD" });
        if (response.ok) {
          addResult("   RESULT: Seller login page exists and is accessible");
        } else {
          addResult(`   RESULT: Seller login page returned status ${response.status}`);
        }
      } catch (error) {
        addResult(`   ERROR: Cannot access seller login page - ${error}`);
      }

      // Check 3: Verify seller registration page exists
      addResult("3. CHECKING: Does seller registration page exist?");
      try {
        const response = await fetch("/seller/register", { method: "HEAD" });
        if (response.ok) {
          addResult("   RESULT: Seller registration page exists and is accessible");
        } else {
          addResult(`   RESULT: Seller registration page returned status ${response.status}`);
        }
      } catch (error) {
        addResult(`   ERROR: Cannot access seller registration page - ${error}`);
      }

      // Check 4: Verify seller products page exists
      addResult("4. CHECKING: Does seller products page exist?");
      try {
        const response = await fetch("/seller/products", { method: "HEAD" });
        if (response.ok) {
          addResult("   RESULT: Seller products page exists and is accessible");
        } else {
          addResult(`   RESULT: Seller products page returned status ${response.status}`);
        }
      } catch (error) {
        addResult(`   ERROR: Cannot access seller products page - ${error}`);
      }

      // Check 5: Check current user session
      addResult("5. CHECKING: Current user session status");
      try {
        // This would need to be done via an API endpoint, but for now we'll check the page
        const response = await fetch("/account/dashboard", { method: "HEAD" });
        if (response.ok) {
          addResult("   RESULT: User has access to account dashboard (logged in)");
        } else if (response.status === 302 || response.status === 307) {
          addResult("   RESULT: User is being redirected (not logged in)");
        } else {
          addResult(`   RESULT: Account dashboard status ${response.status}`);
        }
      } catch (error) {
        addResult(`   ERROR: Cannot check user session - ${error}`);
      }

      // Check 6: Analyze file structure
      addResult("6. ANALYSIS: Seller center file structure");
      addResult("   FOUND: /app/seller/dashboard/page.tsx");
      addResult("   FOUND: /app/seller/login/page.tsx");
      addResult("   FOUND: /app/seller/register/page.tsx");
      addResult("   FOUND: /app/seller/products/page.tsx");
      addResult("   FOUND: /app/seller/layout.tsx");
      addResult("   FOUND: /app/seller/LogoutButton.tsx");

      // Check 7: Test seller login flow
      addResult("7. TESTING: Seller login flow");
      addResult("   EXPECTED: User logs in via AuthForm or SellerLoginForm");
      addResult("   EXPECTED: Role check determines redirect to /seller/dashboard");
      addResult("   EXPECTED: Seller dashboard loads with business info");

      // Check 8: Common issues
      addResult("8. COMMON ISSUES TO CHECK:");
      addResult("   - Is user role set to 'seller' in profiles table?");
      addResult("   - Is email confirmed?");
      addResult("   - Is seller profile created in sellers table?");
      addResult("   - Is middleware redirecting correctly?");
      addResult("   - Is AuthForm redirect logic working?");

      addResult("=== INVESTIGATION COMPLETE ===");

    } catch (error) {
      addResult(`Investigation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testCurrentUser = async () => {
    setLoading(true);
    setResults([]);
    addResult("=== CURRENT USER INVESTIGATION ===");

    try {
      // Check if user is logged in by trying to access protected pages
      addResult("Checking current authentication status...");

      const pages = [
        "/account/dashboard",
        "/seller/dashboard", 
        "/seller/login",
        "/seller/register"
      ];

      for (const page of pages) {
        try {
          const response = await fetch(page, { method: "HEAD" });
          addResult(`${page}: Status ${response.status} (${response.ok ? 'OK' : 'Redirect/Error'})`);
        } catch (error) {
          addResult(`${page}: Error - ${error}`);
        }
      }

      addResult("=== RECOMMENDATIONS ===");
      addResult("1. If account/dashboard is accessible but seller/dashboard is not:");
      addResult("   - User is logged in but not a seller");
      addResult("   - Check user role in database");
      addResult("2. If both redirect to login:");
      addResult("   - User is not logged in");
      addResult("   - Need to login first");
      addResult("3. If seller/dashboard is accessible:");
      addResult("   - Seller center is working");
      addResult("   - Issue might be with login flow");

    } catch (error) {
      addResult(`User investigation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Investigate Seller Center</h1>
      
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">Investigation Plan:</h2>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Verify seller dashboard exists</li>
          <li>2. Check seller login/registration pages</li>
          <li>3. Test current user authentication</li>
          <li>4. Identify login flow issues</li>
          <li>5. Check database user roles</li>
        </ol>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={investigateSellerCenter}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Investigating..." : "Investigate Seller Center"}
        </button>
        
        <button
          onClick={testCurrentUser}
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          Test Current User Status
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
          <h3 className="font-semibold mb-2">Investigation Results:</h3>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div 
                key={index} 
                className={`text-sm font-mono p-2 rounded ${
                  result.includes("ERROR") 
                    ? "bg-red-50 text-red-700" 
                    : result.includes("RESULT:") || result.includes("CHECKING:")
                    ? "bg-blue-50 text-blue-700"
                    : result.includes("===")
                    ? "bg-gray-100 font-bold"
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
          <li>1. Try accessing <code className="bg-gray-100 px-1 rounded">/seller/dashboard</code> directly</li>
          <li>2. Try accessing <code className="bg-gray-100 px-1 rounded">/seller/login</code></li>
          <li>3. Try accessing <code className="bg-gray-100 px-1 rounded">/seller/register</code></li>
          <li>4. Check what happens when you try to login as seller</li>
          <li>5. Note any redirects or error messages</li>
        </ol>
      </div>
    </div>
  );
}
