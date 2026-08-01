'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AuthModal } from '@/components/modals/AuthModal';
import { getErrorMessage } from '@/lib/errorHandling';
import type { OAuthAuthorizationDetails } from '@supabase/supabase-js';

export default function OAuthConsentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
          <LoadingSpinner message="Loading authorization request..." />
        </div>
      }
    >
      <OAuthConsentContent />
    </Suspense>
  );
}

function OAuthConsentContent() {
  const searchParams = useSearchParams();
  const authorizationId = searchParams.get('authorization_id');
  const { user, loading: authLoading } = useAuth();

  const [details, setDetails] = useState<OAuthAuthorizationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [deciding, setDeciding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user || !authorizationId) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId);
      if (cancelled) return;

      if (error) {
        setError(getErrorMessage(error, 'Failed to load authorization request'));
      } else if ('redirect_url' in data) {
        window.location.href = data.redirect_url;
        return;
      } else {
        setDetails(data);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, authorizationId]);

  const handleDecision = async (approve: boolean) => {
    if (!authorizationId) return;
    setDeciding(true);
    setError(null);

    const { data, error } = approve
      ? await supabase.auth.oauth.approveAuthorization(authorizationId, {
          skipBrowserRedirect: true,
        })
      : await supabase.auth.oauth.denyAuthorization(authorizationId, {
          skipBrowserRedirect: true,
        });

    if (error) {
      setError(getErrorMessage(error, 'Failed to record your decision'));
      setDeciding(false);
      return;
    }

    window.location.href = data.redirect_url;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4 py-12">
      {!authorizationId ? (
        <div className="w-full max-w-md">
          <Alert variant="error">
            Missing authorization request. Please restart the connection.
          </Alert>
        </div>
      ) : authLoading ? (
        <LoadingSpinner message="Checking your session..." />
      ) : !user ? (
        <AuthModal isOpen onClose={() => {}} />
      ) : loading ? (
        <LoadingSpinner message="Loading authorization request..." />
      ) : (
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-4">
          <h1 className="text-lg font-semibold text-gray-900">Authorize access</h1>

          {error && <Alert variant="error">{error}</Alert>}

          {details && (
            <>
              <p className="text-sm text-gray-600">
                <span className="font-medium">{details.client.name}</span> wants to access your
                sommething account (<span className="font-medium">{details.user.email}</span>) with
                the following permissions:
              </p>
              <ul className="text-sm text-gray-700 list-disc list-inside">
                {details.scope.split(' ').map((scope) => (
                  <li key={scope}>{scope}</li>
                ))}
              </ul>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  fullWidth
                  disabled={deciding}
                  onClick={() => handleDecision(false)}
                >
                  Deny
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  loading={deciding}
                  onClick={() => handleDecision(true)}
                >
                  Allow
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
