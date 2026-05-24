import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexto/AuthContext';
import Rutas from './componentes/estructura/Rutas';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Rutas />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;