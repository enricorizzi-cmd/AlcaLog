import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Se l'utente è loggato, mostra la dashboard
    // La dashboard è in (dashboard)/page.tsx che è accessibile da / quando si usa il route group
    // Per mantenere /dashboard come URL, reindirizziamo
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
