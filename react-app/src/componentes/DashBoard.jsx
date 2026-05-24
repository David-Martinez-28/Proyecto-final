import { useAuth } from '../hooks/ApiLogin/useAuth';
import VistaPaciente from './VistaPaciente'; // El que hicimos antes
import VistaDietista from './VistaDietista'; // El que haremos ahora

const Dashboard = () => {
    const { user } = useAuth();

    // Dependiendo del rol, renderizamos un componente u otro
    if (user?.role === 'paciente') {
        return <VistaPaciente />;
    }

    if (user?.role === 'dietista') {
        return <VistaDietista />;
    }

    return <div>No tienes un rol asignado. Contacta con el administrador.</div>;
};

export default Dashboard;