"use client";

import { TamboProvider, TamboThreadProvider } from "@tambo-ai/react";
import { useAuth } from "@clerk/nextjs";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  peerPathTamboComponents,
  createPeerPathTamboTools,
  type TamboToolScope,
} from "@/components/tambo/registry";

/* ------------------------------------------------------------------ */
/*  Auth-status context – consumed by AuthStatusBanner in copilot-panel */
/* ------------------------------------------------------------------ */

type AuthStatus = {
  isLoading: boolean;
  error: string | null;
  mode: "clerk-token";
};

const AuthStatusContext = createContext<AuthStatus>({
  isLoading: true,
  error: null,
  mode: "clerk-token",
});

export function usePeerPathTamboAuthStatus() {
  return useContext(AuthStatusContext);
}

/* ------------------------------------------------------------------ */
/*  PeerPathTamboProvider                                              */
/*  Self-contained: fetches the Clerk JWT, then renders TamboProvider  */
/*  with the registered components + scoped tools.                     */
/* ------------------------------------------------------------------ */

type PeerPathTamboProviderProps = {
  contextKey: string;
  scope?: TamboToolScope;
  children: ReactNode;
};

export function PeerPathTamboProvider({
  contextKey,
  scope,
  children,
}: PeerPathTamboProviderProps) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [accessToken, setAccessToken] = useState<string | undefined>();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isTokenLoading, setIsTokenLoading] = useState(true);

  useEffect(() => {
    async function fetchToken() {
      if (!isLoaded) return;

      if (!isSignedIn) {
        setAuthError("You must be signed in to use the copilot.");
        setIsTokenLoading(false);
        return;
      }

      try {
        const token = await getToken({ template: "tambo" });
        setAccessToken(token || undefined);
        setAuthError(null);
      } catch (err) {
        console.error("Error fetching Clerk token for Tambo:", err);
        setAuthError(
          err instanceof Error ? err.message : "Failed to fetch auth token"
        );
      } finally {
        setIsTokenLoading(false);
      }
    }

    fetchToken();
  }, [isLoaded, isSignedIn, getToken]);

  const authStatus = useMemo<AuthStatus>(
    () => ({
      isLoading: isTokenLoading,
      error: authError,
      mode: "clerk-token",
    }),
    [isTokenLoading, authError]
  );

  const tools = useMemo(() => createPeerPathTamboTools(scope), [scope]);

  // Don't render TamboProvider until we have a token (or an error)
  if (isTokenLoading) {
    return (
       <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading copilot...</p>
      </div>
    );
  }

  return (
    <AuthStatusContext.Provider value={authStatus}>
      <TamboProvider
        apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
        userToken={accessToken}
        components={peerPathTamboComponents}
        tools={tools}
      >
        <TamboThreadProvider contextKey={contextKey}>
          {children}
        </TamboThreadProvider>
      </TamboProvider>
    </AuthStatusContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Default export – thin wrapper kept for layout-level usage          */
/*  Does NOT block rendering while token loads.                        */
/* ------------------------------------------------------------------ */

export default function MyTamboProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
