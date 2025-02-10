import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Message from './pages/Message';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/chat' element={<Message />} />
    </Routes>
  )
}

export default App
