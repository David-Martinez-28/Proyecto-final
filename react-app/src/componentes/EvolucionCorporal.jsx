import React from 'react';
import { Card, Table, Badge, Alert } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EvolucionCorporal = ({ stats }) => {
    // 1. NORMALIZACIÓN Y CÁLCULO DE IMC
    let datosNormalizados = [];
    if (Array.isArray(stats)) datosNormalizados = stats;
    else if (stats?.data && Array.isArray(stats.data)) datosNormalizados = stats.data;
    else if (stats && typeof stats === 'object') datosNormalizados = Object.values(stats);

    if (datosNormalizados.length === 0) {
        return <p className="text-muted text-center p-4">No hay datos registrados aún.</p>;
    }

    // 2. PROCESAMIENTO: Orden cronológico y cálculo de IMC
    const dataProcesada = [...datosNormalizados]
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .map(s => ({
            ...s,
            // Cálculo del IMC redondeado a 1 decimal
            imc: parseFloat((s.peso / Math.pow(s.altura / 100, 2)).toFixed(1)),
            fecha: new Date(s.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
        }));

    const primerRegistro = dataProcesada[0];
    const ultimoRegistro = dataProcesada[dataProcesada.length - 1];
    const diferenciaPeso = (ultimoRegistro.peso - primerRegistro.peso).toFixed(1);

    const dataTabla = [...dataProcesada].reverse();

    return (
        <div className="evolucion-container py-2">
            <h4 className="fw-bold mb-3 text-dark">Evolución de Composición Corporal</h4>
            
            {dataProcesada.length > 1 && (
                <Alert variant={parseFloat(diferenciaPeso) <= 0 ? "success" : "primary"} className="shadow-sm border-0 rounded-3">
                    <strong>Resumen: </strong> 
                    {parseFloat(diferenciaPeso) <= 0 ? "Ha disminuido " : "Ha aumentado "} 
                    <span className="fw-bold">{Math.abs(diferenciaPeso)} kg</span> desde el primer registro.
                </Alert>
            )}

            <Card className="border-0 shadow-sm p-3 mb-4 rounded-4 border-top border-primary border-4 bg-white">
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={dataProcesada} margin={{ top: 15, right: 10, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="fecha" tick={{ fontSize: 12, fill: '#6c757d' }} />
                        <YAxis yAxisId="left" domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 'auto']} tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                        <Legend />
                        <Line yAxisId="left" name="Peso (kg)" dataKey="peso" stroke="#0d6efd" strokeWidth={3} dot={{r: 4}} />
                        <Line yAxisId="left" name="IMC" dataKey="imc" stroke="#6610f2" strokeWidth={2} strokeDasharray="5 5" dot={{r: 3}} />
                        <Line yAxisId="left" name="Masa Musc. (kg)" dataKey="masa_muscular" stroke="#198754" strokeWidth={3} dot={{r: 4}} />
                        <Line yAxisId="right" name="% Grasa" dataKey="porcentaje_graso" stroke="#dc3545" strokeWidth={3} dot={{r: 4}} />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

            <h4 className="fw-bold mb-3 text-dark">Registro Histórico</h4>
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                <Table hover className="mb-0 align-middle text-center">
                    <thead className="table-light">
                        <tr className="small text-uppercase text-muted">
                            <th className="text-start ps-4">Fecha</th>
                            <th>Peso</th>
                            <th>IMC</th>
                            <th>% Grasa</th>
                            <th>Masa Musc.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataTabla.map((s, i) => (
                            <tr key={i} style={{ height: '55px' }}>
                                <td className="text-start ps-4 fw-medium text-secondary">
                                    {new Date(s.created_at).toLocaleDateString('es-ES')}
                                </td>
                                <td><Badge bg="primary" className="rounded-pill">{s.peso} kg</Badge></td>
                                <td className="fw-bold text-dark">{s.imc}</td>
                                <td className="fw-bold text-danger">{s.porcentaje_graso ?? '-'}%</td>
                                <td className="fw-bold text-success">{s.masa_muscular ?? '-'} kg</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>
        </div>
    );
};

export default EvolucionCorporal;