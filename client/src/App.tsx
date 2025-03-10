import { NavigationProvider } from './contexts/NavigationProvider';
import { MessageProvider } from './contexts/MessageProvider';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import { ThemeProvider } from './contexts/ThemeProvider';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import MessagesLayout from './pages/MessagesLayout';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationProvider>
          <MessageProvider>
            <Routes>
            {/* Public routes */}
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='/reset-password' element={<ResetPassword />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path='/*' element={<MessagesLayout />} />
            </Route>
          </Routes>
          </MessageProvider>
        </NavigationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App