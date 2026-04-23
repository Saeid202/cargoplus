"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

export default function TestSellerAccessPage() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testDirectAccess = async () => {
    setLoading(true);
    setResults([]);
    addResult("=== TESTING SELLER DASHBOARD ACCESS ===");

    try {
      // Test 1: Try to access seller dashboard directly
      addResult("1. Testing direct access to /seller/dashboard");
      try {
        const response = await fetch("/seller/dashboard", { 
          method: "GET",
          redirect: "manual" // Don't follow redirects automatically
        });
        
        addResult(`   Status: ${response.status}`);
        addResult(`   OK: ${response.ok}`);
        
        if (response.status === 307 || response.status === 302) {
          const location = response.headers.get('location');
          addResult(`   Redirected to: ${location}`);
          
          if (location === "/seller/login") {
            addResult("   DIAGNOSIS: Being redirected to login - not authenticated as seller");
          } else if (location === "/") {
            addResult("   DIAGNOSIS: Being redirected to home - not a valid seller");
          }
        } else if (response.ok) {
          addResult("   SUCCESS: Can access seller dashboard directly!");
        } else {
          addResult(`   ERROR: Unexpected status ${response.status}`);
        }
      } catch (error) {
        addResult(`   ERROR: ${error}`);
      }

      // Test 2: Check current authentication status
      addResult("2. Checking authentication status");
      try {
        const supabase = createBrowserClient();
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          addResult(`   Auth error: ${error.message}`);
        } else if (session) {
          addResult(`   Authenticated: ${session.user.email}`);
          addResult(`   User ID: ${session.user.id}`);
          addResult(`   Email confirmed: ${!!session.user.email_confirmed_at}`);
        } else {
          addResult("   Not authenticated");
        }
      } catch (error) {
        addResult(`   Auth check error: ${error}`);
      }

      // Test 3: Try accessing seller login page
      addResult("3. Testing access to /seller/login");
      try {
        const response = await fetch("/seller/login", { method: "HEAD" });
        addResult(`   Status: ${response.status} (${response.ok ? 'Accessible' : 'Redirect/Error'})`);
      } catch (error) {
        addResult(`   Error: ${error}`);
      }

      // Test 4: Try the regular login page
      addResult("4. Testing access to /auth/login");
      try {
        const response = await fetch("/auth/login", { method: "HEAD" });
        addResult(`   Status: ${response.status} (${response.ok ? 'Accessible' : 'Redirect/Error'})`);
      } catch (error) {
        addResult(`   Error: ${error}`);
      }

    } catch (error) {
      addResult(`Test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testSellerLogin = async () => {
    setLoading(true);
    setResults([]);
    addResult("=== TESTING SELLER LOGIN FLOW ===");

    try {
      const supabase = createBrowserClient();
      
      // Check if user is logged in
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        addResult(`Session error: ${sessionError.message}`);
        setLoading(false);
        return;
      }
      
      if (!session) {
        addResult("User not logged in - please login first");
        addResult("Go to /auth/login to login");
        setLoading(false);
        return;
      }
      
      addResult(`Logged in as: ${session.user.email}`);
      addResult(`User ID: ${session.user.id}`);
      
      // Check profiles table
      addResult("Checking profiles table...");
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      
      if (profileError) {
        addResult(`Profile error: ${profileError.message}`);
      } else {
        addResult(`Profile role: ${(profile as any)?.role || 'NOT SET'}`);
      }
      
      // Check sellers table
      addResult("Checking sellers table...");
      const { data: seller, error: sellerError } = await supabase
        .from("sellers")
        .select("*")
        .eq("id", session.user.id)
        .single();
      
      if (sellerError) {
        addResult(`Seller error: ${sellerError.message}`);
      } else if (seller) {
        addResult("Seller profile found:");
        addResult(`  Business name: ${(seller as any).business_name}`);
        addResult(`  Status: ${(seller as any).status}`);
      } else {
        addResult("No seller profile found");
      }
      
      // Final diagnosis
      addResult("=== FINAL DIAGNOSIS ===");
      const userRole = (profile as any)?.role;
      const hasSellerProfile = !!seller;
      
      if (userRole !== "seller") {
        addResult("ISSUE: User role is not 'seller'");
        addResult("FIX: Update profiles table to set role='seller'");
      } else if (!hasSellerProfile) {
        addResult("ISSUE: Missing seller profile in sellers table");
        addResult("FIX: Create seller profile in sellers table");
      } else {
        addResult("ISSUE: Authentication should work");
        addResult("FIX: Check proxy.ts logic or restart server");
      }

    } catch (error) {
      addResult(`Test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const createQuickSellerProfile = async () => {
    setLoading(true);
    setResults([]);
    addResult("=== CREATING QUICK SELLER PROFILE ===");

    try {
      const supabase = createBrowserClient();
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        addResult("ERROR: Not logged in");
        setLoading(false);
        return;
      }
      
      // Create seller profile with minimal required fields
      const { data, error } = await supabase
        .from("sellers")
        .upsert({
          id: session.user.id,
          business_name: session.user.user_metadata?.full_name || "Business Name",
          business_email: session.user.email || "",
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) {
        addResult(`ERROR: ${error.message}`);
      } else {
        addResult("SUCCESS: Seller profile created!");
        addResult(`Business: ${(data as any).business_name}`);
        addResult(`Status: ${(data as any).status}`);
        addResult("Now try accessing /seller/dashboard");
      }

    } catch (error) {
      addResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test Seller Access</h1>
      
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">Issue: Can't access seller dashboard</h2>
        <p className="text-sm text-red-800">
          User can login but seller dashboard access fails
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={testDirectAccess}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Direct Access"}
        </button>
        
        <button
          onClick={testSellerLogin}
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          Test Seller Login Status
        </button>
        
        <button
          onClick={createQuickSellerProfile}
          disabled={loading}
          className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
        >
          Create Quick Seller Profile
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
                    : result.includes("SUCCESS")
                    ? "bg-green-50 text-green-700 font-bold"
                    : result.includes("ISSUE")
                    ? "bg-yellow-50 text-yellow-700"
                    : result.includes("FIX")
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

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Quick Steps:</h3>
        <ol className="text-sm space-y-1">
          <li>1. Click "Test Direct Access" to see what happens</li>
          <li>2. Click "Test Seller Login Status" to check authentication</li>
          <li>3. If needed, click "Create Quick Seller Profile"</li>
          <li>4. Try accessing /seller/dashboard again</li>
        </ol>
      </div>
    </div>
  );
}
