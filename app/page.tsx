import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Redirect alla dashboard che è in (dashboard)/page.tsx
    // In Next.js App Router, (dashboard) è un route group quindi la pagina è accessibile da /
    // Per mantenere /dashboard, creiamo un redirect
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
