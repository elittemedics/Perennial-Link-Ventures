import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Role } from '@prisma/client';

// This route reads the request cookie to select a user dashboard.
export const dynamic = 'force-dynamic';

export default async function DashboardRootPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role === Role.ADMINISTRATOR || (user.role as string) === 'ADMIN') {
    redirect('/dashboard/admin');
  }

  if (user.role === Role.BUSINESS_OWNER) {
    redirect('/dashboard/owner');
  }

  redirect('/listings');
}
