"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

export default function TestSellerLoginPage() {
  const [email, setEmail] = useState("chinaplusgroup@gmail.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testLoginFlow = async () => {
    setLoading(true);
    setResults([]);
    addResult("Starting seller login test");

    try {
      const supabase = createBrowserClient();
      
      // Step 1: Sign in
      addResult("Step 1: Attempting sign in...");
      const signInStart = Date.now();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      const signInEnd = Date.now();
      
      if (error) {
        addResult(`Sign in error: ${error.message}`);
        return;
      }
      
      addResult(`Sign in successful (${signInEnd - signInStart}ms)`);
      
      if (!data.user) {
        addResult("No user data returned");
        return;
      }

      addResult(`User: ${data.user.email}`);
      addResult(`Email confirmed: ${!!data.user.email_confirmed_at}`);

      // Step 2: Check profile
      addResult("Step 2: Checking user profile...");
      const profileStart = Date.now();
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();
      const profileEnd = Date.now();
      
      addResult(`Profile query completed (${profileEnd - profileStart}ms)`);
      addResult(`Profile data: ${JSON.stringify(profile)}`);
      
      if (!profile) {
        addResult("No profile found");
        return;
      }

      const userRole = (profile as any)?.role;
      addResult(`User role: ${userRole}`);

      // Step 3: Test redirect logic
      addResult("Step 3: Testing redirect logic...");
      
      if (userRole === "seller") {
        addResult("Should redirect to /seller/dashboard");
        addResult("Current window.location: " + window.location.href);
        
        // Test the redirect
        addResult("Executing redirect to seller dashboard...");
        window.location.href = "/seller/dashboard";
      } else if (userRole === "admin") {
        addResult("Should redirect to /admin/dashboard");
        window.location.href = "/admin/dashboard";
      } else {
        addResult("Should redirect to home page");
        window.location.href = "/";
      }

    } catch (error) {
      addResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentSession = async () => {
    setLoading(true);
    setResults([]);
    addResult("Checking current session...");

    try {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        addResult(`Active session found: ${session.user.email}`);
        addResult(`Email confirmed: ${!!session.user.email_confirmed_at}`);
        
        // Check profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        
        addResult(`Profile role: ${(profile as any)?.role || 'Not found'}`);
      } else {
        addResult("No active session");
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
      <h1 className="text-2xl font-bold mb-6">Test Seller Login Flow</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">Issue:</h2>
        <p className="text-sm text-yellow-800">
          User chinaplusgroup@gmail.com has 'seller' role in database but is being redirected to buyer dashboard.
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="chinaplusgroup@gmail.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Enter your password"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={testLoginFlow}
            disabled={loading || !password}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Testing..." : "Test Login Flow"}
          </button>
          
          <button
            onClick={checkCurrentSession}
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Check Current Session
          </button>
          
          <button
            onClick={clearResults}
            className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
          >
            Clear Results
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div key={index} className="text-sm font-mono bg-gray-50 p-2 rounded">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
