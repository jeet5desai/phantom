import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';

import LayoutWrapper from './components/LayoutWrapper';
import AuthSync from './components/AuthSync';

// Pages
import Home from './pages/Home';
import ApiKeys from './pages/ApiKeys';
import Settings from './pages/Settings';
import SSOCallback from './pages/SSOCallback';
import SignInPage from './pages/SignIn';
import SignUpPage from './pages/SignUp';
import Notifications from './pages/Notifications';
import Resources from './pages/Resources';
import DocViewer from './pages/DocViewer';
import Vault from './pages/Vault';
import Permissions from './pages/Permissions';
import Integrations from './pages/Integrations';
import Agents from './pages/Agents';
import AgentDetails from './pages/AgentDetails';
import AuditLogs from './pages/AuditLogs';
import NotFound from './pages/NotFound';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

export default function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/sign-in">
      <AuthSync />
      <BrowserRouter>
        <LayoutWrapper>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/api-keys" element={<ApiKeys />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/sso-callback" element={<SSOCallback />} />
            <Route path="/sign-in/*" element={<SignInPage />} />
            <Route path="/sign-up/*" element={<SignUpPage />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resources/:slug" element={<DocViewer />} />
            <Route path="/vault" element={<Vault />} />
            <Route path="/permissions" element={<Permissions />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/agents/:id" element={<AgentDetails />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </LayoutWrapper>
      </BrowserRouter>
    </ClerkProvider>
  );
}
