import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    // 2. Initialize admin client for deletion
    const adminAuthClient = createAdminClient()

    // 3. Delete user's public profile data (Supabase RLS or Admin can handle this, 
    //    but Admin client bypasses RLS). 
    //    We can also rely on cascade deletes if they are set up correctly in the database.
    
    // Note: auth.users deletion cascades to dependent tables if FKs have ON DELETE CASCADE.
    // Assuming profiles, blocks, reports, matches, messages have CASCADE.
    // If not, we could explicitly delete them here. To be safe, we will just delete the user 
    // and rely on Supabase cascade, or manual cleanup if needed.

    const { error: deleteUserError } = await adminAuthClient.auth.admin.deleteUser(userId)

    if (deleteUserError) {
      console.error('Error deleting user account:', deleteUserError)
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
    }

    // Sign out is handled on the client side after this returns 200 OK.
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Unexpected error in delete-account API:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
