import DashboardPageContent from './page_content';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Renderizza la dashboard con URL /dashboard
export default async function DashboardRoute() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <DashboardPageContent />;
}
