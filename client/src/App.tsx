import { Routes, Route } from 'react-router-dom';
import AuthProvider from './components/auth/AuthProvider';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import MessagesLayout from './pages/MessagesLayout';
import EmptyConversation from './components/ui/EmptyConversation';
import ConversationView from './components/ui/ConversationView';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path='/' element={<MessagesLayout />}>
            <Route index element={<EmptyConversation />} />
            <Route path='/conversations/:id' element={<ConversationView />} />
            <Route path='/settings' element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
