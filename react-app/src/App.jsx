import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexto/AuthContext'; // Tu proveedor de Login
import ClinicaProvider from './contexto/contexto';    // Tu proveedor de datos
import Rutas from './componentes/estructura/Rutas';
import Footer from './componentes/estructura/PiePagina';

function App() {
  return (
    
    <AuthProvider>
      <ClinicaProvider> 
        <BrowserRouter>
          <Rutas />
          <Footer />
        </BrowserRouter>
      </ClinicaProvider>
    </AuthProvider>
  );
}

export default App;