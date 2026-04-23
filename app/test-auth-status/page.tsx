"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

export default function TestAuthStatusPage() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testAuthentication = async () => {
    setLoading(true);
    setResults([]);
    addResult("=== TESTING AUTHENTICATION STATUS ===");

    try {
      const supabase = createBrowserClient();
      
      // Test 1: Check current session
      addResult("1. Checking current session...");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        addResult(`   Session error: ${sessionError.message}`);
      } else if (session) {
        addResult(`   Session found: ${session.user.email}`);
        addResult(`   User ID: ${session.user.id}`);
        addResult(`   Email confirmed: ${!!session.user.email_confirmed_at}`);
        addResult(`   Created at: ${session.user.created_at}`);
      } else {
        addResult("   No session found - user not logged in");
        addResult("   SOLUTION: User needs to login first");
        setLoading(false);
        return;
      }

      // Test 2: Check user profile in profiles table
      addResult("2. Checking user profile in profiles table...");
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        addResult(`   Profile error: ${profileError.message}`);
      } else if (profile) {
        addResult(`   Profile found:`);
        addResult(`   - Role: ${(profile as any).role}`);
        addResult(`   - Email: ${(profile as any).email}`);
        addResult(`   - Full name: ${(profile as any).full_name}`);
        addResult(`   - Created: ${(profile as any).created_at}`);
      } else {
        addResult("   No profile found in profiles table");
        addResult("   SOLUTION: Profile missing in database");
      }

      // Test 3: Check seller profile in sellers table
      addResult("3. Checking seller profile in sellers table...");
      const { data: sellerProfile, error: sellerError } = await supabase
        .from("sellers")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (sellerError) {
        addResult(`   Seller profile error: ${sellerError.message}`);
      } else if (sellerProfile) {
        addResult(`   Seller profile found:`);
        addResult(`   - Business name: ${(sellerProfile as any).business_name}`);
        addResult(`   - Business email: ${(sellerProfile as any).business_email}`);
        addResult(`   - Status: ${(sellerProfile as any).status}`);
        addResult(`   - Created: ${(sellerProfile as any).created_at}`);
      } else {
        addResult("   No seller profile found in sellers table");
        addResult("   SOLUTION: Seller profile missing in database");
      }

      // Test 4: Try accessing seller dashboard
      addResult("4. Testing seller dashboard access...");
      try {
        const response = await fetch("/seller/dashboard", { method: "HEAD" });
        addResult(`   Status: ${response.status} (${response.ok ? 'Accessible' : 'Redirect/Error'})`);
        
        if (response.redirected) {
          addResult(`   Redirected to: ${response.url}`);
        }
      } catch (error) {
        addResult(`   Error accessing dashboard: ${error}`);
      }

      // Test 5: Analysis and recommendations
      addResult("=== ANALYSIS & RECOMMENDATIONS ===");
      
      const userRole = (profile as any)?.role;
      const hasSellerProfile = !!sellerProfile;
      const isEmailConfirmed = !!session.user.email_confirmed_at;

      addResult(`User role: ${userRole || 'NOT SET'}`);
      addResult(`Has seller profile: ${hasSellerProfile ? 'YES' : 'NO'}`);
      addResult(`Email confirmed: ${isEmailConfirmed ? 'YES' : 'NO'}`);

      if (!isEmailConfirmed) {
        addResult("ISSUE: Email not confirmed");
        addResult("SOLUTION: Check email and confirm account");
      } else if (userRole !== "seller") {
        addResult("ISSUE: User role is not 'seller'");
        addResult("SOLUTION: Update user role to 'seller' in profiles table");
      } else if (!hasSellerProfile) {
        addResult("ISSUE: Seller profile missing");
        addResult("SOLUTION: Create seller profile in sellers table");
      } else {
        addResult("ISSUE: Authentication should work");
        addResult("SOLUTION: Check seller dashboard server component");
      }

    } catch (error) {
      addResult(`Test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const tryLogin = async () => {
    setLoading(true);
    setResults([]);
    addResult("=== ATTEMPTING LOGIN ===");

    try {
      // This would need user credentials
      addResult("Please go to /seller/login to login");
      addResult("Or use the regular login form with your credentials");
      addResult("Then come back to this page to check status");
    } catch (error) {
      addResult(`Login error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test Authentication Status</h1>
      
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">Current Issue:</h2>
        <p className="text-sm text-red-800">
          User trying to access /seller/dashboard but system can't login
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={testAuthentication}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Authentication Status"}
        </button>
        
        <button
          onClick={tryLogin}
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          Try Login
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
                  result.includes("ERROR") || result.includes("error:")
                    ? "bg-red-50 text-red-700" 
                    : result.includes("ISSUE:")
                    ? "bg-yellow-50 text-yellow-700"
                    : result.includes("SOLUTION:")
                    ? "bg-green-50 text-green-700"
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

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Next Steps:</h3>
        <ol className="text-sm space-y-1">
          <li>1. Run the authentication test above</li>
          <li>2. Check if user role is 'seller'</li>
          <li>3. Verify seller profile exists</li>
          <li>4. Confirm email is verified</li>
          <li>5. Follow the recommended solution</li>
        </ol>
      </div>
    </div>
  );
}
