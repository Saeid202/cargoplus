"use client";

import { useState } from "react";

export default function TestSupabaseConnectionPage() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testSupabaseConnection = async () => {
    setLoading(true);
    setResults([]);
    addResult("=== TESTING SUPABASE CONNECTION ===");

    try {
      // Test 1: Check environment variables
      addResult("1. Checking environment variables...");
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (supabaseUrl) {
        addResult(`   SUPABASE_URL: ${supabaseUrl}`);
      } else {
        addResult("   ERROR: NEXT_PUBLIC_SUPABASE_URL not found");
        addResult("   SOLUTION: Check .env.local file");
      }
      
      if (supabaseAnonKey) {
        addResult(`   SUPABASE_ANON_KEY: ${supabaseAnonKey.substring(0, 10)}...`);
      } else {
        addResult("   ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY not found");
        addResult("   SOLUTION: Check .env.local file");
      }

      if (!supabaseUrl || !supabaseAnonKey) {
        addResult("   CRITICAL: Environment variables missing - cannot continue");
        setLoading(false);
        return;
      }

      // Test 2: Try to create Supabase client
      addResult("2. Creating Supabase client...");
      try {
        const { createBrowserClient } = await import("@/lib/supabase/client");
        const supabase = createBrowserClient();
        addResult("   SUCCESS: Supabase client created");
      } catch (error) {
        addResult(`   ERROR: Failed to create Supabase client - ${error}`);
        setLoading(false);
        return;
      }

      // Test 3: Test basic connection
      addResult("3. Testing basic Supabase connection...");
      try {
        const { createBrowserClient } = await import("@/lib/supabase/client");
        const supabase = createBrowserClient();
        
        // Test a simple health check
        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);
        
        if (error) {
          addResult(`   ERROR: Database connection failed - ${error.message}`);
        } else {
          addResult("   SUCCESS: Database connection working");
        }
      } catch (error) {
        addResult(`   ERROR: Connection test failed - ${error}`);
      }

      // Test 4: Test authentication service
      addResult("4. Testing authentication service...");
      try {
        const { createBrowserClient } = await import("@/lib/supabase/client");
        const supabase = createBrowserClient();
        
        // Test getting current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          addResult(`   ERROR: Auth service failed - ${sessionError.message}`);
        } else if (session) {
          addResult(`   SUCCESS: Auth service working - User: ${session.user.email}`);
        } else {
          addResult("   SUCCESS: Auth service working - No active session");
        }
      } catch (error) {
        addResult(`   ERROR: Auth service test failed - ${error}`);
      }

      // Test 5: Test network connectivity to Supabase
      addResult("5. Testing network connectivity...");
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'GET',
          headers: {
            'apikey': supabaseAnonKey,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          addResult(`   SUCCESS: Network connection working (${response.status})`);
        } else {
          addResult(`   ERROR: Network connection failed (${response.status})`);
        }
      } catch (error) {
        addResult(`   ERROR: Network test failed - ${error}`);
      }

      // Test 6: Simulate the exact login call that's failing
      addResult("6. Testing signInWithPassword (simulated)...");
      addResult("   NOTE: This would normally require user credentials");
      addResult("   The 'Failed to fetch' error suggests:");
      addResult("   - Network connectivity issues");
      addResult("   - CORS configuration problems");
      addResult("   - Supabase service issues");
      addResult("   - Environment variable problems");

      addResult("=== RECOMMENDATIONS ===");
      addResult("1. Check internet connection");
      addResult("2. Verify .env.local file has correct Supabase URL and keys");
      addResult("3. Check Supabase project status (is it active?)");
      addResult("4. Verify CORS settings in Supabase dashboard");
      addResult("5. Try restarting the development server");

    } catch (error) {
      addResult(`Test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testEnvironment = () => {
    setLoading(true);
    setResults([]);
    addResult("=== ENVIRONMENT CHECK ===");

    addResult(`NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET'}`);
    addResult(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'}`);
    addResult(`NODE_ENV: ${process.env.NODE_ENV}`);
    addResult(`Browser: ${navigator.userAgent}`);
    addResult(`Current URL: ${window.location.href}`);

    addResult("=== CHECKLIST ===");
    addResult("1. Is .env.local file in project root?");
    addResult("2. Does .env.local contain NEXT_PUBLIC_SUPABASE_URL?");
    addResult("3. Does .env.local contain NEXT_PUBLIC_SUPABASE_ANON_KEY?");
    addResult("4. Is the Supabase project active?");
    addResult("5. Have you restarted the dev server after .env changes?");

    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test Supabase Connection</h1>
      
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">Current Error:</h2>
        <p className="text-sm text-red-800">
          "Failed to fetch" error in SellerLoginForm when calling supabase.auth.signInWithPassword()
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={testSupabaseConnection}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Supabase Connection"}
        </button>
        
        <button
          onClick={testEnvironment}
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          Check Environment
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
                    : result.includes("SUCCESS")
                    ? "bg-green-50 text-green-700"
                    : result.includes("===")
                    ? "bg-gray-100 font-bold"
                    : result.includes("RECOMMENDATIONS") || result.includes("CHECKLIST")
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
        <h3 className="font-semibold mb-2">Quick Fixes to Try:</h3>
        <ol className="text-sm space-y-1">
          <li>1. Check that .env.local file exists in project root</li>
          <li>2. Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set</li>
          <li>3. Restart development server (npm run dev)</li>
          <li>4. Check internet connection</li>
          <li>5. Verify Supabase project is active in dashboard</li>
        </ol>
      </div>
    </div>
  );
}
