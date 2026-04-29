import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useDispatch } from 'react-redux';
import { setAuth, clearAuth } from '@/store/authSlice';
import { apiRequest } from '@/lib/api';

export default function AuthSync() {
  const { isLoaded: authLoaded, userId, getToken } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const dispatch = useDispatch();

  useEffect(() => {
    const sync = async () => {
      if (authLoaded && userLoaded) {
        if (userId && user) {
          const token = await getToken();
          if (token) {
            // Sync user data with our database manually
            await apiRequest(
              'POST',
              '/api/v1/users/sync',
              {
                email: user.primaryEmailAddress?.emailAddress || '',
                firstName: user.firstName,
                lastName: user.lastName,
                imageUrl: user.imageUrl,
              },
              token,
            );

            dispatch(
              setAuth({
                token,
                user: {
                  id: user.id,
                  email: user.primaryEmailAddress?.emailAddress || '',
                  fullName: user.fullName,
                  imageUrl: user.imageUrl,
                },
              }),
            );
          }
        } else {
          dispatch(clearAuth());
        }
      }
    };

    sync();

    // Set up an interval to refresh the token in Redux every 50 seconds
    // (Clerk tokens usually last 1 minute)
    const interval = setInterval(sync, 50000);
    return () => clearInterval(interval);
  }, [authLoaded, userLoaded, userId, user, getToken, dispatch]);

  return null;
}
