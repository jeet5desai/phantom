import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import SignInForm from '@/components/auth/SignInForm';

export default async function SignInPage() {
  const { userId } = await auth();

  if (userId) {
    redirect('/');
  }

  return <SignInForm />;
}
