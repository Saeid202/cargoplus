"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

export default function DebugLoginPerformancePage() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testLoginPerformance = async () => {
    setLoading(true);
    setResults([]);
    addResult("=== LOGIN PERFORMANCE DEBUG ===");

    try {
      const supabase = createBrowserClient();
      
      // Test 1: Supabase client creation time
      const clientStart = Date.now();
      const client = createBrowserClient();
      const clientEnd = Date.now();
      addResult(`Supabase client creation: ${clientEnd - clientStart}ms`);

      // Test 2: Session check time
      const sessionStart = Date.now();
      const { data: { session } } = await supabase.auth.getSession();
      const sessionEnd = Date.now();
      addResult(`Session check: ${sessionEnd - sessionStart}ms, hasSession: ${!!session}`);

      if (!session) {
        addResult("No session found. User must login first.");
        addResult("Please login and then check the console for debug logs.");
        return;
      }

      // Test 3: Profile query time
      const profileStart = Date.now();
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      const profileEnd = Date.now();
      
      addResult(`Profile query: ${profileEnd - profileStart}ms`);
      addResult(`Profile error: ${profileError?.message || 'None'}`);
      addResult(`Profile data: ${JSON.stringify(profile)}`);

      // Test 4: Simulate the exact AuthForm flow with timing
      addResult("=== SIMULATING AUTHFORM FLOW ===");
      
      const authFlowStart = Date.now();
      
      // Step 1: Sign in (simulated)
      addResult("Step 1: signInWithPassword...");
      const signInStart = Date.now();
      // This would normally be the actual sign in, but we'll simulate since user is already logged in
      const signInEnd = Date.now();
      addResult(`signInWithPassword: ${signInEnd - signInStart}ms (simulated)`);
      
      // Step 2: Email confirmation check
      addResult("Step 2: Email confirmation check...");
      const emailCheckStart = Date.now();
      const emailConfirmed = !!session.user.email_confirmed_at;
      const emailCheckEnd = Date.now();
      addResult(`Email confirmation check: ${emailCheckEnd - emailCheckStart}ms, confirmed: ${emailConfirmed}`);
      
      // Step 3: Profile query for role
      addResult("Step 3: Profile query for role...");
      const roleQueryStart = Date.now();
      const { data: roleProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      const roleQueryEnd = Date.now();
      addResult(`Role query: ${roleQueryEnd - roleQueryStart}ms`);
      
      const userRole = (roleProfile as any)?.role;
      addResult(`User role: ${userRole}`);
      
      // Step 4: Redirect decision
      addResult("Step 4: Redirect decision...");
      const redirectStart = Date.now();
      
      if (userRole === "seller") {
        addResult("DECISION: Should redirect to /seller/dashboard");
        addResult("ACTION: window.location.href = '/seller/dashboard'");
        // Don't actually redirect, just log it
      } else if (userRole === "admin") {
        addResult("DECISION: Should redirect to /admin/dashboard");
      } else {
        addResult("DECISION: Should redirect to home page");
      }
      
      const redirectEnd = Date.now();
      addResult(`Redirect decision: ${redirectEnd - redirectStart}ms`);
      
      const authFlowEnd = Date.now();
      addResult(`Total AuthForm flow simulation: ${authFlowEnd - authFlowStart}ms`);

      // Test 5: Check if there are any slow operations
      addResult("=== PERFORMANCE ANALYSIS ===");
      
      if (profileEnd - profileStart > 1000) {
        addResult("WARNING: Profile query is slow (>1s)");
      }
      
      if (sessionEnd - sessionStart > 500) {
        addResult("WARNING: Session check is slow (>500ms)");
      }

      addResult("=== RECOMMENDATIONS ===");
      addResult("1. Check browser console during actual login");
      addResult("2. Look for 'AuthForm:' debug messages");
      addResult("3. Note any operations taking >1s");
      addResult("4. Check if middleware is causing delays");

    } catch (error) {
      addResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentState = async () => {
    setLoading(true);
    setResults([]);
    addResult("=== CURRENT USER STATE CHECK ===");

    try {
      const supabase = createBrowserClient();
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        addResult(`Logged in as: ${session.user.email}`);
        addResult(`Email confirmed: ${!!session.user.email_confirmed_at}`);
        addResult(`User ID: ${session.user.id}`);
        addResult(`Current URL: ${window.location.href}`);
        
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        
        addResult(`Profile role: ${(profile as any)?.role || 'NOT FOUND'}`);
        
        addResult("=== EXPECTED BEHAVIOR ===");
        if ((profile as any)?.role === "seller") {
          addResult("Should be on: /seller/dashboard");
          addResult("If on buyer dashboard, fallback redirect should trigger");
        }
      } else {
        addResult("Not logged in");
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
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Debug Login Performance</h1>
      
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">Issues to Debug:</h2>
        <ul className="text-sm text-red-800 space-y-1">
          <li>1. Login taking a long time to render</li>
          <li>2. User not being redirected to seller dashboard</li>
        </ul>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={testLoginPerformance}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Login Performance"}
        </button>
        
        <button
          onClick={checkCurrentState}
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          Check Current State
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
          <h3 className="font-semibold mb-2">Debug Results:</h3>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div 
                key={index} 
                className={`text-sm font-mono p-2 rounded ${
                  result.includes("WARNING") 
                    ? "bg-yellow-50 text-yellow-700" 
                    : result.includes("===")
                    ? "bg-blue-50 text-blue-700 font-bold"
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
        <h3 className="font-semibold mb-2">Next Steps:</h3>
        <ol className="text-sm space-y-1">
          <li>1. Try to login with chinaplusgroup@gmail.com</li>
          <li>2. Watch browser console for debug logs</li>
          <li>3. Note where the delay occurs</li>
          <li>4. Check if redirect happens at all</li>
          <li>5. Use this page to analyze performance</li>
        </ol>
      </div>
    </div>
  );
}
