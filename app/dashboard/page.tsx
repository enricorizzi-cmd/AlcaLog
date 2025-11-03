import DashboardPage from '@/app/(dashboard)/page';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Renderizza la dashboard da (dashboard)/page.tsx ma con URL /dashboard
export default async function DashboardRoute() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <DashboardPage />;
}

