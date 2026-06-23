import { ReactNode } from 'react';
import { UserLayout } from '@/components/user/UserLayout';

export default function Layout({ children }: { children: ReactNode }) {
  return <UserLayout>{children}</UserLayout>;
}
