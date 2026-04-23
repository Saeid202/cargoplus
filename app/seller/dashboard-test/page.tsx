"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

export default function SellerDashboardTestPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }
        
        setUser(session.user);
        
        // Check profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        
        // Check sellers table
        const { data: seller } = await supabase
          .from("sellers")
          .select("business_name, status")
          .eq("id", session.user.id)
          .single();
        
        if (!profile || profile.role !== "seller") {
          setError("Not a seller");
        } else if (!seller) {
          setError("No seller profile");
        } else {
          setError(null);
        }
        
      } catch (err) {
        setError(`Error: ${err}`);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-sm text-red-700 mb-4">{error}</p>
            <a href="/seller/login" className="text-blue-600 hover:underline">
              Go to Seller Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">Seller Dashboard (Test)</h1>
          <p className="text-gray-600">Welcome back, {user?.email}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Dashboard Status</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Authentication: Working</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Seller Profile: Working</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Dashboard: Should work</span>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              If this page loads, the issue is with the proxy.ts middleware.
              The seller dashboard should work but the proxy is redirecting you.
            </p>
          </div>
          
          <div className="mt-4 space-y-2">
            <a href="/seller/dashboard" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Try Original Dashboard
            </a>
            <a href="/" className="inline-block px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 ml-2">
              Go to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
