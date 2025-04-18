import { Navigate } from 'react-router-dom';

// Layout
import MainLayout from './components/Layout/MainLayout';

// Pages
import Dashboard from './components/Dashboard/Dashboard';
import DatabaseConnection from './components/DatabaseConnection/DatabaseConnection';
import QueryInterface from './components/QueryInterface/QueryInterface';
import ResultsDisplay from './components/ResultsDisplay/ResultsDisplay';
import SavedVisualizations from './components/Visualizations/SavedVisualizations';
import AccountSettings from './components/Settings/AccountSettings';
import NotFound from './components/common/NotFound';

const routes = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: '/', element: <Navigate to="/dashboard" /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'connections', element: <DatabaseConnection /> },
      { path: 'query', element: <QueryInterface /> },
      { path: 'results', element: <ResultsDisplay /> },
      { path: 'visualizations', element: <SavedVisualizations /> },
      { path: 'settings', element: <AccountSettings /> },
      { path: '404', element: <NotFound /> },
      { path: '*', element: <Navigate to="/404" /> }
    ]
  }
];

export default routes;
