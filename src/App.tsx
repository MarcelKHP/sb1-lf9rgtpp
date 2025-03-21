import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getCurrentUser } from './lib/auth';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import RequestDetails from './components/RequestDetails';
import ChangeRequestForm from './components/ChangeRequestForm';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    getCurrentUser().then(user => setIsAuthenticated(!!user));
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthForm />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/new"
          element={
            <PrivateRoute>
              <ChangeRequestForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/request/:id"
          element={
            <PrivateRoute>
              <RequestDetails />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;