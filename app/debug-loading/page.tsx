"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

export default function DebugLoadingPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testSupabaseConnection = async () => {
    addResult("Testing Supabase connection...");
    setLoading(true);
    
    try {
      const supabase = createBrowserClient();
      addResult("Supabase client created");
      
      // Test basic connection
      const startTime = Date.now();
      const { data: { session } } = await supabase.auth.getSession();
      const endTime = Date.now();
      addResult(`GetSession completed in ${endTime - startTime}ms, hasSession: ${!!session}`);
      
      if (session) {
        // Test getUser
        const getUserStart = Date.now();
        const { data: { user } } = await supabase.auth.getUser();
        const getUserEnd = Date.now();
        addResult(`GetUser completed in ${getUserEnd - getUserStart}ms, hasUser: ${!!user}`);
        
        if (user) {
          // Test profile query
          const profileStart = Date.now();
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();
          const profileEnd = Date.now();
          addResult(`Profile query completed in ${profileEnd - profileStart}ms, hasProfile: ${!!profile}`);
        }
      }
      
      addResult("Supabase connection test completed successfully");
    } catch (error) {
      addResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testDirectLogin = async () => {
    addResult("Testing direct login with chinaplusgroup@gmail.com...");
    setLoading(true);
    
    try {
      const supabase = createBrowserClient();
      
      const startTime = Date.now();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "chinaplusgroup@gmail.com",
        password: "test-password" // User should replace with actual password
      });
      const endTime = Date.now();
      
      addResult(`SignIn completed in ${endTime - startTime}ms`);
      addResult(`HasError: ${!!error}, HasData: ${!!data}`);
      
      if (error) {
        addResult(`Error: ${error.message}`);
      } else if (data.session && data.user) {
        addResult(`Login successful, user: ${data.user.email}`);
        addResult(`Email confirmed: ${!!data.user.email_confirmed_at}`);
        
        // Test profile query
        const profileStart = Date.now();
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();
        const profileEnd = Date.now();
        
        addResult(`Profile query completed in ${profileEnd - profileStart}ms`);
        addResult(`Profile: ${profile ? JSON.stringify(profile) : 'Not found'}`);
      }
    } catch (error) {
      addResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Debug Loading Issues</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">Instructions:</h2>
        <ol className="text-sm text-gray-700 space-y-1">
          <li>1. Open browser console to see debug logs</li>
          <li>2. Test Supabase connection first</li>
          <li>3. Try login with your actual credentials</li>
          <li>4. Look for any slow operations in console</li>
          <li>5. Check for any errors or timeouts</li>
        </ol>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={testSupabaseConnection}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Supabase Connection"}
        </button>
        
        <button
          onClick={testDirectLogin}
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Direct Login"}
        </button>
        
        <button
          onClick={clearResults}
          className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
        >
          Clear Results
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono bg-gray-50 p-2 rounded">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">What to look for:</h3>
        <ul className="text-sm space-y-1">
          <li>Any operation taking more than 2-3 seconds</li>
          <li>Database query timeouts</li>
          <li>Network errors</li>
          <li>Missing user profiles</li>
          <li>Authentication errors</li>
        </ul>
      </div>
    </div>
  );
}
