<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use Exception;

class NotificacionController extends Controller
{
    /**
     * Devolvemos solo las notificaciones no leídas del usuario autenticado.
     */
    public function index()
    {
        // 1. Validamos rigurosamente que el usuario de Sanctum esté autenticado
        if (!auth()->check() || !auth()->id()) {
            return response()->json(['error' => 'Sesión expirada o no autenticado'], 401);
        }

        $userId = auth()->id();

        try {
            // 2. Traemos las notificaciones no leídas de este usuario de forma directa
            $notificaciones = Notificacion::where('user_id', $userId)
                ->where('leido', false)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($notificaciones, 200);

        } catch (Exception $e) {
            
            return response()->json([
                'status' => 'error',
                'message' => 'Error al leer las notificaciones en la base de datos de NutriPanel',
                'error_sql' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Marca una notificación específica como leída de forma segura.
     */
    public function marcarComoLeida($id)
    {
        if (!auth()->check() || !auth()->id()) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        try {
            // 1. Buscamos la notificación directamente por su ID de tabla
            $notificacion = Notificacion::findOrFail($id);

            // 2. Control de seguridad: Verificamos que pertenezca al usuario que hace la petición
            if ($notificacion->user_id !== auth()->id()) {
                return response()->json(['error' => 'No autorizado'], 403);
            }

            // 3. Modificamos el atributo directamente y guardamos en MySQL.
            $notificacion->leido = true;
            $notificacion->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Notificación marcada como leída.'
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'No se pudo marcar la notificación como leída.',
                'error_dev' => $e->getMessage()
            ], 500);
        }
    }
}