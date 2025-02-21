import { NavigationProvider } from './contexts/NavigationProvider';
import { MessageProvider } from './contexts/MessageProvider';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import MessagesLayout from './pages/MessagesLayout';

function App() {
  return (
    <NavigationProvider>
      <AuthProvider>
        <MessageProvider>
        <Routes>
          {/* Public routes */}
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path='/*' element={<MessagesLayout />} />
          </Route>
        </Routes>
      </MessageProvider>
      </AuthProvider>
    </NavigationProvider>
  )
}

export default App