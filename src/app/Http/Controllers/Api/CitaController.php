<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cita;
use Illuminate\Http\Request;
use App\Models\Notificacion; 

class CitaController extends Controller
{
    // EL PACIENTE PIDE UNA CITA 
    public function store(Request $request)
    {
        $request->validate([
            'fecha_hora' => 'required|date|after:now',
            'motivo' => 'nullable|string|max:500',
        ]);

        $userLogueado = auth()->user();

        if ($userLogueado->role !== 'paciente' || !$userLogueado->paciente) {
            return response()->json(['error' => 'No autorizado para solicitar citas'], 403);
        }

        $paciente = $userLogueado->paciente;

        $cita = Cita::create([
            'paciente_id' => $paciente->id,
            'dietista_id' => $paciente->dietista_id, 
            'fecha_hora' => $request->fecha_hora,
            'motivo' => $request->motivo,
            'estado' => 'pendiente',
        ]);

        $dietistaUserId = $paciente->dietista->user_id;

        Notificacion::create([
            'user_id' => $dietistaUserId,           
            'remitente_id' => $userLogueado->id,    
            'tipo_accion' => 'nueva_cita',          
            'mensaje' => 'El paciente ' . $userLogueado->name . ' ha solicitado una nueva cita para el ' . $request->fecha_hora . '.',
            'leido' => false
        ]);

        return response()->json([
            'status' => 'success',
            'message' => '¡Cita solicitada y dietista notificado correctamente!',
            'data' => $cita
        ], 201);
    }

    //Para vcer mis citas
    public function misCitas(Request $request)
    {
        $dietista = $request->user()->dietista;

        if (!$dietista) {
            return response()->json(['message' => 'Solo los dietistas pueden ver esta agenda'], 403);
        }

        $citas = Cita::with('paciente.user') 
                     ->where('dietista_id', $dietista->id)
                     ->orderBy('fecha_hora', 'asc')
                     ->get();

        return response()->json($citas, 200);
    }

    //Actualiza el estado de la cita
   public function actualizarEstado(Request $request, $id)
    {
        $cita = Cita::findOrFail($id);

        $request->validate([
            'estado' => 'required|in:confirmada,cancelada,rechazada',
            'motivo_cancelacion' => 'nullable|string|max:500'
        ]);

        $userLogueado = $request->user();
        
        
        $esSuDietista = $userLogueado->dietista && ($cita->dietista_id === $userLogueado->dietista->id);
        $esSuPaciente = $userLogueado->paciente && ($cita->paciente_id === $userLogueado->paciente->id);

        if (!$esSuDietista && !$esSuPaciente) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $cita->update([
            'estado' => $request->estado,
            'motivo_cancelacion' => $request->motivo_cancelacion 
        ]);

        $motivoTexto = $request->motivo_cancelacion 
            ? "\nMotivo indicado: \"" . $request->motivo_cancelacion . "\"" 
            : "";

        
        if ($userLogueado->role === 'paciente') {
            Notificacion::create([
                'user_id' => $cita->dietista->user_id,
                'remitente_id' => $userLogueado->id,
                'tipo_accion' => 'cita_cancelada',
                'mensaje' => "El paciente {$userLogueado->name} ha cancelado la cita pautada para el {$cita->fecha_hora}.{$motivoTexto}",
                'leido' => false
            ]);
        } else {
            if ($cita->paciente) {
                $textoAccion = $cita->estado === 'confirmada' ? 'aceptada' : 'rechazada/cancelada';
                Notificacion::create([
                    'user_id' => $cita->paciente->user_id,
                    'remitente_id' => $userLogueado->id,
                    'tipo_accion' => $cita->estado === 'confirmada' ? 'cita_aceptada' : 'cita_rechazada',
                    'mensaje' => "Tu cita solicitada para el {$cita->fecha_hora} ha sido {$textoAccion} por tu dietista.{$motivoTexto}",
                    'leido' => false
                ]);
            }
        }

        return response()->json(['status' => 'success', 'message' => 'Cita actualizada'], 200);
    }
        public function misCitasPaciente(Request $request)
    {
        $user = $request->user();

        if (!$user->paciente) {
            return response()->json(['message' => 'Perfil de paciente no encontrado'], 404);
        }

        // Buscamos todas las citas asociadas al id del paciente logueado
        $citas = Cita::where('paciente_id', $user->paciente->id)
                    ->orderBy('fecha_hora', 'desc')
                    ->get();

        return response()->json($citas, 200);
    }
}