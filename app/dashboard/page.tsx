import { redirect } from 'next/navigation';

// Redirect da /dashboard a / (dove si trova la dashboard in (dashboard)/page.tsx)
export default function DashboardRedirect() {
  redirect('/');
}

