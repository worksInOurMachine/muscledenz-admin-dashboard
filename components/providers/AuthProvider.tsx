"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

const AuthProvider = ({
  children,
  session,
}: {
  children: any;
  session?: any;
}) => {
        
  return <><Toaster position="top-center"/><SessionProvider refetchOnWindowFocus={false} session={session}>{children}</SessionProvider></>;
};

export default AuthProvider;
