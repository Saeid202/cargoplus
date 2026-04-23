"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

export default function TestSellerRedirectPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const testLogin = async () => {
    setLoading(true);
    setResult(null);

    try {
      const supabase = createBrowserClient();
      
      // Step 1: Sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setResult(`Sign in error: ${signInError.message}`);
        setLoading(false);
        return;
      }

      if (!signInData.user) {
        setResult("No user data returned");
        setLoading(false);
        return;
      }

      // Step 2: Check user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, email, full_name")
        .eq("id", signInData.user.id)
        .single();

      if (profileError) {
        setResult(`Profile error: ${profileError.message}`);
        setLoading(false);
        return;
      }

      // Step 3: Check seller profile
      const { data: sellerProfile, error: sellerError } = await supabase
        .from("sellers")
        .select("business_name, status")
        .eq("id", signInData.user.id)
        .single();

      const sellerInfo = sellerError ? "No seller profile" : sellerProfile;

      setResult(`
        SUCCESS: User authenticated and profile found
        
        User Info:
        - Email: ${signInData.user.email}
        - Email Confirmed: ${signInData.user.email_confirmed_at ? 'Yes' : 'No'}
        - User ID: ${signInData.user.id}
        
        Profile:
        - Role: ${profile?.role}
        - Profile Email: ${profile?.email}
        - Full Name: ${profile?.full_name}
        
        Seller Profile:
        - Business Name: ${sellerInfo?.business_name || 'N/A'}
        - Status: ${sellerInfo?.status || 'N/A'}
        
        Expected Redirect: ${profile?.role === 'seller' ? '/seller/dashboard' : profile?.role === 'admin' ? '/admin/dashboard' : '/'}
      `);

    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test Seller Redirect Logic</h1>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <p className="text-sm text-gray-600 mb-2">
          This page tests the login redirect logic for sellers. Use it to verify that sellers are redirected to the correct dashboard.
        </p>
        <p className="text-sm text-gray-600">
          Test with: chinaplusgroup@gmail.com (should redirect to /seller/dashboard)
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
            placeholder="Enter password"
          />
        </div>
        <button
          onClick={testLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Login & Redirect Logic"}
        </button>
      </div>

      {result && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
