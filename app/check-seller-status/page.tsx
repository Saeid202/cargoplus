"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

export default function CheckSellerStatusPage() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const checkSellerStatus = async () => {
    setLoading(true);
    setResults([]);
    addResult("=== CHECKING SELLER STATUS ===");

    try {
      const supabase = createBrowserClient();
      
      // Test 1: Check current session
      addResult("1. Checking current session...");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        addResult(`   Session error: ${sessionError.message}`);
        setLoading(false);
        return;
      } else if (session) {
        addResult(`   Session found: ${session.user.email}`);
        addResult(`   User ID: ${session.user.id}`);
        addResult(`   Email confirmed: ${!!session.user.email_confirmed_at}`);
      } else {
        addResult("   No session found - user not logged in");
        addResult("   SOLUTION: Please login first");
        setLoading(false);
        return;
      }

      // Test 2: Check profiles table
      addResult("2. Checking profiles table...");
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        addResult(`   Profile error: ${profileError.message}`);
      } else if (profile) {
        addResult(`   Profile found in profiles table:`);
        addResult(`   - Role: ${(profile as any).role}`);
        addResult(`   - Email: ${(profile as any).email}`);
        addResult(`   - Full name: ${(profile as any).full_name}`);
      } else {
        addResult("   No profile found in profiles table");
        addResult("   SOLUTION: Create profile in profiles table");
      }

      // Test 3: Check sellers table
      addResult("3. Checking sellers table...");
      const { data: sellerProfile, error: sellerError } = await supabase
        .from("sellers")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (sellerError) {
        addResult(`   Seller profile error: ${sellerError.message}`);
      } else if (sellerProfile) {
        addResult(`   Seller profile found in sellers table:`);
        addResult(`   - Business name: ${(sellerProfile as any).business_name}`);
        addResult(`   - Business email: ${(sellerProfile as any).business_email}`);
        addResult(`   - Status: ${(sellerProfile as any).status}`);
        addResult(`   - Created: ${(sellerProfile as any).created_at}`);
      } else {
        addResult("   No seller profile found in sellers table");
        addResult("   SOLUTION: Create seller profile in sellers table");
      }

      // Test 4: Analysis
      addResult("=== ANALYSIS ===");
      const userRole = (profile as any)?.role;
      const hasSellerProfile = !!sellerProfile;
      const isEmailConfirmed = !!session.user.email_confirmed_at;

      addResult(`User role in profiles: ${userRole || 'NOT SET'}`);
      addResult(`Has seller profile: ${hasSellerProfile ? 'YES' : 'NO'}`);
      addResult(`Email confirmed: ${isEmailConfirmed ? 'YES' : 'NO'}`);

      // Test 5: Diagnose the issue
      addResult("=== DIAGNOSIS ===");
      if (!isEmailConfirmed) {
        addResult("ISSUE: Email not confirmed");
        addResult("SOLUTION: Check email and confirm account");
      } else if (userRole !== "seller") {
        addResult("ISSUE: User role is not 'seller' in profiles table");
        addResult("SOLUTION: Update profiles table to set role='seller'");
      } else if (!hasSellerProfile) {
        addResult("ISSUE: Missing seller profile in sellers table");
        addResult("SOLUTION: Create seller profile in sellers table");
        addResult("This is likely the main issue!");
      } else {
        addResult("ISSUE: All checks passed - should be able to access seller centre");
        addResult("SOLUTION: Check if there are other authentication issues");
      }

      // Test 6: Try accessing seller dashboard
      addResult("=== TESTING SELLER DASHBOARD ACCESS ===");
      try {
        const response = await fetch("/seller/dashboard", { method: "HEAD" });
        addResult(`   Status: ${response.status} (${response.ok ? 'Accessible' : 'Redirect/Error'})`);
        
        if (response.redirected) {
          addResult(`   Redirected to: ${response.url}`);
        }
      } catch (error) {
        addResult(`   Error accessing dashboard: ${error}`);
      }

    } catch (error) {
      addResult(`Check error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const createSellerProfile = async () => {
    setLoading(true);
    setResults([]);
    addResult("=== CREATING SELLER PROFILE ===");

    try {
      const supabase = createBrowserClient();
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        addResult("ERROR: No session found - please login first");
        setLoading(false);
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (!profile || (profile as any).role !== "seller") {
        addResult("ERROR: User role is not 'seller' in profiles table");
        addResult("SOLUTION: Update profiles table first");
        setLoading(false);
        return;
      }

      // Create seller profile
      const { data: sellerProfile, error: sellerError } = await supabase
        .from("sellers")
        .insert({
          id: session.user.id,
          business_name: (profile as any).full_name || "Business Name",
          business_email: session.user.email,
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (sellerError) {
        addResult(`ERROR: Failed to create seller profile - ${sellerError.message}`);
      } else {
        addResult("SUCCESS: Seller profile created!");
        addResult(`Business name: ${(sellerProfile as any).business_name}`);
        addResult(`Status: ${(sellerProfile as any).status}`);
        addResult("Now try accessing the seller dashboard!");
      }

    } catch (error) {
      addResult(`Create error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Check Seller Status</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">Current Issue:</h2>
        <p className="text-sm text-yellow-800">
          User can login but can't access seller centre
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={checkSellerStatus}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Checking..." : "Check Seller Status"}
        </button>
        
        <button
          onClick={createSellerProfile}
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          Create Missing Seller Profile
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
          <h3 className="font-semibold mb-2">Check Results:</h3>
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
                    : result.includes("SUCCESS")
                    ? "bg-green-50 text-green-700 font-bold"
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
        <h3 className="font-semibold mb-2">Most Likely Issues:</h3>
        <ol className="text-sm space-y-1">
          <li>1. Missing seller profile in sellers table</li>
          <li>2. User role not set to 'seller' in profiles table</li>
          <li>3. Email not confirmed</li>
          <li>4. Database connection issues</li>
        </ol>
      </div>
    </div>
  );
}
