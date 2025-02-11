import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components';
import { ProtectedRoute } from './components';
import Home from './pages/Home';
import Conversation from './pages/Conversation';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route index element={<Home />} />
          <Route path='/conversations/:id' element={<Conversation />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
