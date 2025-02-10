import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components';
import Home from './pages/Home';
import Conversation from './pages/Conversation';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route index element={<Home />} />
        <Route path='/conversations/:id' element={<Conversation />} />
        <Route path='login' element={<Login />} />
        <Route path='register' element={<Register />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
