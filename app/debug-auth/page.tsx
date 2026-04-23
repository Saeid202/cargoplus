"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

export default function DebugAuthPage() {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createBrowserClient();
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          setError(`Session error: ${sessionError.message}`);
          return;
        }
        
        setSession(session);
        
        if (session?.user) {
          setUser(session.user);
          console.log("Current user:", session.user);
        }
      } catch (err) {
        setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "chinaplusgroup@gmail.com",
        password: "test-password" // User should replace with actual password
      });
      
      if (error) {
        setError(`Sign in error: ${error.message}`);
      } else {
        console.log("Sign in result:", data);
        setUser(data.user);
        setSession(data.session);
      }
    } catch (err) {
      setError(`Sign in error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const supabase = createBrowserClient();
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (err) {
      setError(`Sign out error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Current User Status</h2>
          {user ? (
            <div className="space-y-2">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Email Confirmed:</strong> {user.email_confirmed_at ? `Yes (${new Date(user.email_confirmed_at).toLocaleString()})` : 'No'}</p>
              <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
              <p><strong>Last Sign In:</strong> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}</p>
              
              <div className="mt-4">
                <h3 className="font-semibold mb-2">User Metadata:</h3>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(user.user_metadata, null, 2)}
                </pre>
              </div>
              
              <div className="mt-4">
                <h3 className="font-semibold mb-2">App Metadata:</h3>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(user.app_metadata, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p>No user logged in</p>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Session Status</h2>
          {session ? (
            <div className="space-y-2">
              <p><strong>Active:</strong> Yes</p>
              <p><strong>Expires:</strong> {new Date(session.expires_at! * 1000).toLocaleString()}</p>
              <p><strong>Access Token:</strong> {session.access_token.substring(0, 20)}...</p>
            </div>
          ) : (
            <p>No active session</p>
          )}
        </div>
        
        <div className="space-y-2">
          <button
            onClick={handleSignIn}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Test Sign In (chinaplusgroup@gmail.com)
          </button>
          
          <button
            onClick={handleSignOut}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 ml-2"
          >
            Sign Out
          </button>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
          <p className="text-sm">
            <strong>Instructions:</strong> Use this page to debug the authentication issue. 
            Check the browser console for additional logging information.
          </p>
        </div>
      </div>
    </div>
  );
}
