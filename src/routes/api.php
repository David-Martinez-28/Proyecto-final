<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DietistaController;
use App\Http\Controllers\Api\PacienteController;
use App\Http\Controllers\Api\ComidaController;
use App\Http\Controllers\Api\RutinaController;
use App\Http\Controllers\Api\EjercicioController;
use App\Http\Controllers\Api\IngredienteController;
use App\Http\Controllers\Api\CitaController;
use App\Http\Controllers\Api\UsuariosController;
use App\Http\Controllers\Api\NotificacionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --- RUTAS PÚBLICAS ---
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// --- RUTAS PROTEGIDAS (Middleware Sanctum) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/user/update', [UsuariosController::class, 'update']);
    Route::delete('/user/delete', [UsuariosController::class, 'destroy']);
    
    // 💡 LAS TRASLADAMOS AQUÍ: Las rutas fijas y personalizadas de notificaciones siempre ARRIBA
    Route::get('/notificaciones', [NotificacionController::class, 'index']);
    Route::post('/notificaciones/{id}/leer', [NotificacionController::class, 'marcarComoLeida']);
    
    // --- RUTAS DE CITAS PERSONALIZADAS (Arriba del recurso) ---
    Route::get('/dietista/mis-citas', [CitaController::class, 'misCitas']); 
    Route::get('/paciente/mis-citas', [CitaController::class, 'misCitasPaciente']);
    Route::post('/citas/{cita}/estado', [CitaController::class, 'actualizarEstado']); // Unificado (eliminado duplicado)
    Route::post('/citas', [CitaController::class, 'store']); 
    
    // Perfil del usuario autenticado
    Route::get('/user', function (Request $request) {
        return $request->user()->load($request->user()->role === 'paciente' ? 'paciente' : 'dietista');
    });
    
    // Rutas de estadísticas y evolución
    Route::get('/paciente/{id}/estadisticas', [PacienteController::class, 'getEstadisticasPaciente']);
    Route::post('/pacientes/estadisticas/{id?}', [PacienteController::class, 'guardarEstadistica']);
    
    // Subida de foto de perfil
    Route::post('/user/avatar', [AuthController::class, 'uploadAvatar']);

    // --- RECURSOS API (Abajo del todo para que sus comodines no pisen nada) ---
    Route::apiResource('dietistas', DietistaController::class);
    Route::apiResource('pacientes', PacienteController::class);
    Route::apiResource('comidas', ComidaController::class);
    Route::apiResource('rutinas', RutinaController::class);
    Route::apiResource('ejercicios', EjercicioController::class); 
    Route::apiResource('ingredientes', IngredienteController::class);
    Route::apiResource('usuarios', UsuariosController::class);
    
    // Excluimos 'store' de este resource porque ya lo declaramos manualmente arriba de forma específica
    Route::apiResource('citas', CitaController::class)->except(['store']);
    
    // --- ASIGNACIÓN DE RUTINAS (Bloques enteros) ---
    Route::post('/pacientes/{id}/asignar-rutina', [PacienteController::class, 'asignarRutina']);
    Route::delete('/pacientes/{id}/quitar-rutina/{rutina_id}', [PacienteController::class, 'quitarRutina']);
    
    // --- ASIGNACIÓN DE EJERCICIOS EN LA CUADRÍCULA (Drag & Drop) ---
    Route::post('/pacientes/{id}/asignar-ejercicio', [PacienteController::class, 'asignarEjercicio']);
    Route::delete('/pacientes/{id}/quitar-ejercicio', [PacienteController::class, 'quitarEjercicio']);

    // Rutas de asignación lógica
    Route::post('/pacientes/{paciente}/asignar-comida', [PacienteController::class, 'asignarComida']);
    Route::delete('/pacientes/{id}/quitar-comida', [PacienteController::class, 'quitarComida']);
    Route::post('/rutinas/{rutina}/agregar-ejercicio', [RutinaController::class, 'agregarEjercicio']);
    Route::post('/comidas/{comida}/agregar-ingrediente', [ComidaController::class, 'agregarIngrediente']);
    
    // EL CORAZÓN DEL FRONTEND: El plan del paciente logueado
    Route::get('/mi-plan', [PacienteController::class, 'obtenerPlan']);
    Route::post('/pacientes/{id}/archivar-plan', [PacienteController::class, 'archivarPlan']);
    
    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);
});