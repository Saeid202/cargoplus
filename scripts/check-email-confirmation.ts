// Script to check email confirmation status for chinaplusgroup@gmail.com
// Run this with: npx tsx scripts/check-email-confirmation.ts

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Please check your .env.local file.');
  process.exit(1);
}

async function checkEmailConfirmation() {
  const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('Checking email confirmation status for chinaplusgroup@gmail.com...');
    
    // Try to get user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return;
    }

    const targetUser = users.find(user => user.email === 'chinaplusgroup@gmail.com');
    
    if (!targetUser) {
      console.log('User chinaplusgroup@gmail.com not found');
      return;
    }

    console.log('User found:', {
      id: targetUser.id,
      email: targetUser.email,
      email_confirmed_at: targetUser.email_confirmed_at,
      created_at: targetUser.created_at,
      last_sign_in_at: targetUser.last_sign_in_at,
      phone_confirmed_at: targetUser.phone_confirmed_at,
      user_metadata: targetUser.user_metadata,
      app_metadata: targetUser.app_metadata
    });

    // Check if user has profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetUser.id)
      .single();

    if (profileError) {
      console.log('Profile error:', profileError);
    } else {
      console.log('User profile:', profile);
    }

    // Try to manually confirm email if needed
    if (!targetUser.email_confirmed_at) {
      console.log('Email is not confirmed. Attempting to confirm...');
      
      const { error: confirmError } = await supabase.auth.admin.updateUserById(
        targetUser.id,
        { email_confirm: true }
      );

      if (confirmError) {
        console.error('Error confirming email:', confirmError);
      } else {
        console.log('Email confirmed successfully!');
      }
    } else {
      console.log('Email is already confirmed!');
    }

    // Create missing profile if needed
    if (profileError) {
      console.log('Creating missing user profile...');
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: targetUser.id,
          email: targetUser.email,
          full_name: targetUser.user_metadata?.full_name || null,
          role: targetUser.user_metadata?.role || 'customer',
          created_at: targetUser.created_at,
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error creating profile:', insertError);
      } else {
        console.log('Profile created successfully!');
      }
    }

    // If user is a seller, also create seller profile
    if (targetUser.user_metadata?.role === 'seller') {
      const { data: sellerProfile, error: sellerError } = await supabase
        .from('sellers')
        .select('*')
        .eq('id', targetUser.id)
        .single();

      if (sellerError && sellerError.code === 'PGRST116') {
        console.log('Creating missing seller profile...');
        
        const { error: sellerInsertError } = await supabase
          .from('sellers')
          .insert({
            id: targetUser.id,
            business_name: 'China Plus Group',
            business_email: targetUser.email,
            status: 'active',
            created_at: targetUser.created_at,
            updated_at: new Date().toISOString()
          });

        if (sellerInsertError) {
          console.error('Error creating seller profile:', sellerInsertError);
        } else {
          console.log('Seller profile created successfully!');
        }
      } else if (!sellerError) {
        console.log('Seller profile already exists:', sellerProfile);
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkEmailConfirmation();
