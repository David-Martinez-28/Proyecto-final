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
        <div className="evolucion-container py-2">
            <h4 className="fw-bold mb-3 text-dark">Evolución de Composición Corporal</h4>
            
            {/* Mensaje de progreso dinámico sin fallos de ordenación */}
            {dataCronologica.length > 1 && (
                <Alert variant={parseFloat(diferenciaPeso) <= 0 ? "success" : "primary"} className="shadow-sm border-0 rounded-3">
                    <strong>Resumen de evolución: </strong> 
                    {parseFloat(diferenciaPeso) <= 0 ? "Ha disminuido " : "Ha aumentado "} 
                    <span className="fw-bold">{Math.abs(diferenciaPeso)} kg</span> desde el primer registro antropométrico.
                </Alert>
            )}

            {/* Tarjeta del Gráfico (Paleta de la aplicación) */}
            <Card className="border-0 shadow-sm p-3 mb-4 rounded-4 border-top border-primary border-4 bg-white">
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={dataGrafico} margin={{ top: 15, right: 10, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="fecha" tick={{ fontSize: 12, fill: '#6c757d' }} stroke="#dee2e6" />
                        
                        {/* 📊 EJE IZQUIERDO: Métricas de masa y longitudes (Kg / Cm) */}
                        <YAxis yAxisId="left" domain={['auto', 'auto']} tick={{ fontSize: 12 }} stroke="#dee2e6" />
                        
                        {/* 📊 EJE DERECHO: Exclusivo para porcentajes (%) de tejido adiposo */}
                        <YAxis yAxisId="right" orientation="right" domain={[0, 'auto']} tick={{ fontSize: 12 }} stroke="#dee2e6" />

                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', background: '#fff' }}
                            formatter={(value, name) => {
                                if (name === 'peso') return [`${value} kg`, 'Peso Corporal'];
                                if (name === 'masa_muscular') return [`${value} kg`, 'Masa Muscular'];
                                if (name === 'porcentaje_graso') return [`${value} %`, 'Grasa Corporal'];
                                if (name === 'altura') return [`${value} cm`, 'Estatura'];
                                return [value, name];
                            }}
                            labelFormatter={(label) => `Fecha: ${label}`}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '13px', fontWeight: '500' }} />

                        {/* Líneas del gráfico mapeadas estratégicamente a sus respectivos ejes */}
                        <Line yAxisId="left" name="peso" type="monotone" dataKey="peso" stroke="#0d6efd" strokeWidth={3} dot={{ r: 4, stroke: '#0d6efd', strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                        <Line yAxisId="left" name="masa_muscular" type="monotone" dataKey="masa_muscular" stroke="#198754" strokeWidth={3} dot={{ r: 4, stroke: '#198754', strokeWidth: 2, fill: '#fff' }} connectNulls={true} />
                        <Line yAxisId="right" name="porcentaje_graso" type="monotone" dataKey="porcentaje_graso" stroke="#dc3545" strokeWidth={3} dot={{ r: 4, stroke: '#dc3545', strokeWidth: 2, fill: '#fff' }} connectNulls={true} />
                        <Line yAxisId="left" name="altura" type="monotone" dataKey="altura" stroke="#6c757d" strokeWidth={2} strokeDasharray="4 4" dot={false} connectNulls={true} />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

            {/* Tabla Histórica */}
            <h4 className="fw-bold mb-3 text-dark">Registro Histórico</h4>
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                <div className="table-responsive">
                    <Table hover className="mb-0 align-middle text-center">
                        <thead className="table-light border-bottom">
                            <tr className="small text-uppercase text-muted" style={{ letterSpacing: '0.5px' }}>
                                <th className="text-start ps-4">Fecha de Control</th>
                                <th>Peso Total</th>
                                <th>Estatura</th>
                                <th>% Grasa Adiposa</th>
                                <th>Masa Muscular</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataTabla.map((s, i) => (
                                <tr key={i} className="border-bottom" style={{ height: '55px' }}>
                                    <td className="text-start ps-4 fw-medium text-secondary">
                                        {new Date(s.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                    </td>
                                    <td>
                                        <Badge bg="primary" className="px-3 py-2 rounded-pill fw-bold" style={{ fontSize: '12px' }}>
                                            {s.peso} kg
                                        </Badge>
                                    </td>
                                    <td className="fw-semibold text-dark">{s.altura} cm</td>
                                    <td className="fw-bold text-danger">{s.porcentaje_graso ? `${s.porcentaje_graso}%` : '-'}</td>
                                    <td className="fw-bold text-success">{s.masa_muscular ? `${s.masa_muscular} kg` : '-'}</td>
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