<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cita;
use Illuminate\Http\Request;

class CitaController extends Controller
{
    // 1. EL PACIENTE PIDE UNA CITA
    public function store(Request $request)
    {
        $request->validate([
            'fecha_hora' => 'required|date|after:now',
            'motivo' => 'nullable|string|max:500'
        ]);

        $paciente = $request->user()->paciente;

        if (!$paciente) {
            return response()->json(['message' => 'Solo los pacientes pueden pedir citas'], 403);
        }

        $cita = Cita::create([
            'paciente_id' => $paciente->id,
            'dietista_id' => $paciente->dietista_id, // Se asigna automáticamente a SU dietista
            'fecha_hora' => $request->fecha_hora,
            'motivo' => $request->motivo,
            'estado' => 'pendiente'
        ]);

        return response()->json(['message' => 'Cita solicitada', 'data' => $cita], 201);
    }

    // 2. EL DIETISTA VE SUS CITAS
    public function misCitas(Request $request)
    {
        $dietista = $request->user()->dietista;

        if (!$dietista) {
            return response()->json(['message' => 'Solo los dietistas pueden ver esta agenda'], 403);
        }

        $citas = Cita::with('paciente.user') // Traemos el nombre del paciente
                     ->where('dietista_id', $dietista->id)
                     ->orderBy('fecha_hora', 'asc')
                     ->get();

        return response()->json($citas, 200);
    }

    // 3. EL DIETISTA CONFIRMA/CANCELA LA CITA
    public function actualizarEstado(Request $request, Cita $cita)
    {
        $request->validate(['estado' => 'required|in:confirmada,cancelada']);

        // Verificamos que la cita sea de este dietista
        if ($cita->dietista_id !== $request->user()->dietista->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $cita->update(['estado' => $request->estado]);

        return response()->json(['message' => 'Estado actualizado'], 200);
    }
}