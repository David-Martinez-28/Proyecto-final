// src/components/EvolucionCorporal.jsx
import React from 'react';
import { Card, Table, Badge, Alert } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EvolucionCorporal = ({ stats }) => {
    // 1. NORMALIZACIÓN DE DATOS (Filtro anti-errores de formato de API)
    let datosNormalizados = [];
    
    if (Array.isArray(stats)) {
        datosNormalizados = stats;
    } else if (stats && stats.data && Array.isArray(stats.data)) {
        datosNormalizados = stats.data;
    } else if (stats && typeof stats === 'object') {
        datosNormalizados = Object.values(stats);
    }

    // 2. VALIDACIÓN DE SEGURIDAD
    if (datosNormalizados.length === 0) {
        return <p className="text-muted text-center p-4">No hay datos registrados aún.</p>;
    }

    // 3. ORDENACIÓN EXPLÍCITA CRONOLÓGICA (Garantiza el éxito del gráfico de izquierda a derecha)
    const dataCronologica = [...datosNormalizados].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    // Formateamos las fechas para las etiquetas del eje X del gráfico
    const dataGrafico = dataCronologica.map(s => ({
        ...s,
        fecha: new Date(s.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
    }));

    // 4. CÁLCULO DE PROGRESO CORREGIDO (Garantiza que la resta sea siempre: Actual - Inicial)
    const primerRegistro = dataCronologica[0]; // El más antiguo real
    const ultimoRegistro = dataCronologica[dataCronologica.length - 1]; // El más reciente real
    const diferenciaPeso = (ultimoRegistro.peso - primerRegistro.peso).toFixed(1);

    // 5. ORDENACIÓN PARA LA TABLA (De más reciente a más antiguo)
    const dataTabla = [...dataCronologica].reverse();

    return (
        <div className="evolucion-container">
            <h4 className="fw-bold mb-3">Evolución de Composición Corporal</h4>
            
            {/* Mensaje de progreso dinámico sin fallos de ordenación */}
            {dataCronologica.length > 1 && (
                <Alert variant={parseFloat(diferenciaPeso) <= 0 ? "success" : "warning"} className="shadow-sm border-0">
                    <strong>Resumen de evolución: </strong> 
                    {parseFloat(diferenciaPeso) <= 0 ? "Ha perdido " : "Ha ganado "} 
                    {Math.abs(diferenciaPeso)} kg desde el primer registro.
                </Alert>
            )}

            {/* Tarjeta del Gráfico */}
            <Card className="border-0 shadow-sm p-3 mb-4 rounded-4">
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={dataGrafico} margin={{ top: 5, right: 30, bottom: 5, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="fecha" />
                        
                        {/* Eje principal (izquierdo) para peso y masa muscular */}
                        <YAxis yAxisId="left" domain={['auto', 'auto']} />
                        
                        {/* Eje secundario (derecho) para porcentaje graso */}
                         

                        <Tooltip 
                            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                            formatter={(value, name) => {
                                if (name === 'peso') return [`${value} kg`, 'Peso Actual'];
                                if (name === 'porcentaje_graso') return [`${value} %`, 'Grasa Corporal'];
                                if (name === 'masa_muscular') return [`${value} kg`, 'Masa Muscular'];
                                return [value, name];
                            }}
                            labelFormatter={(label) => `Fecha: ${label}`}
                        />
                        <Legend />

                        {/* Líneas del gráfico mapeadas a sus ejes correspondientes */}
                        <Line yAxisId="left" name="peso" type="monotone" dataKey="peso" stroke="#198754" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line yAxisId="left" name="masa_muscular" type="monotone" dataKey="masa_muscular" stroke="#0d6efd" strokeWidth={3} dot={{ r: 4 }} connectNulls={true} />
                        <Line yAxisId="left" name="porcentaje_graso" type="monotone" dataKey="porcentaje_graso" stroke="#dc3545" strokeWidth={3} dot={{ r: 4 }} connectNulls={true} />
                        <Line yAxisId="left" name="altura" type="monotone" dataKey="altura" stroke="#ffc107" strokeWidth={3} dot={{ r: 4 }} connectNulls={true} />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

            {/* Tabla Histórica */}
            <h4 className="fw-bold mb-4">Registro Histórico</h4>
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <Table hover className="mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Fecha</th>
                                <th>Peso</th>
                                <th>Altura</th>
                                <th>% Grasa</th>
                                <th>Masa Musc.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataTabla.map((s, i) => (
                                <tr key={i} className="border-bottom">
                                    <td className="align-middle">
                                        {new Date(s.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                    </td>
                                    <td className="align-middle"><Badge bg="success" pill>{s.peso} kg</Badge></td>
                                    <td className="align-middle">{s.altura} cm</td>
                                    <td className="align-middle">{s.porcentaje_graso ? `${s.porcentaje_graso}%` : '-'}</td>
                                    <td className="align-middle">{s.masa_muscular ? `${s.masa_muscular} kg` : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </Card>
        </div>
    );
};

export default EvolucionCorporal;