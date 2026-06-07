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
    
    
    Route::get('/notificaciones', [NotificacionController::class, 'index']);
    Route::post('/notificaciones/{id}/leer', [NotificacionController::class, 'marcarComoLeida']);
    
    
    Route::get('/dietista/mis-citas', [CitaController::class, 'misCitas']); 
    Route::get('/paciente/mis-citas', [CitaController::class, 'misCitasPaciente']);
    Route::post('/citas/{cita}/estado', [CitaController::class, 'actualizarEstado']); 
    Route::post('/citas', [CitaController::class, 'store']); 
    
    // Perfil del usuario autenticado
    Route::get('/user', function (Request $request) {
        return $request->user()->load($request->user()->role === 'paciente' ? 'paciente' : 'dietista');
    });
    
    
    Route::get('/paciente/{id}/estadisticas', [PacienteController::class, 'getEstadisticasPaciente']);
    Route::post('/pacientes/estadisticas/{id?}', [PacienteController::class, 'guardarEstadistica']);
    
    
    Route::post('/user/avatar', [AuthController::class, 'uploadAvatar']);

    
    
    Route::post('/comidas/{comida}/agregar-ingrediente', [ComidaController::class, 'agregarIngrediente']);
    Route::post('/rutinas/{rutina}/agregar-ejercicio', [RutinaController::class, 'agregarEjercicio']);

    Route::post('/pacientes/{paciente}/asignar-comida', [PacienteController::class, 'asignarComida']);
    Route::delete('/pacientes/{id}/quitar-comida', [PacienteController::class, 'quitarComida']);

    Route::post('/pacientes/{id}/asignar-rutina', [PacienteController::class, 'asignarRutina']);
    Route::delete('/pacientes/{id}/quitar-rutina/{rutina_id}', [PacienteController::class, 'quitarRutina']);
    
    Route::post('/pacientes/{id}/asignar-ejercicio', [PacienteController::class, 'asignarEjercicio']);
    Route::delete('/pacientes/{id}/quitar-ejercicio', [PacienteController::class, 'quitarEjercicio']);

    
    Route::get('/mi-plan', [PacienteController::class, 'obtenerPlan']);
    Route::post('/pacientes/{id}/archivar-plan', [PacienteController::class, 'archivarPlan']);

    
    Route::apiResource('dietistas', DietistaController::class);
    Route::apiResource('pacientes', PacienteController::class);
    Route::apiResource('comidas', ComidaController::class);
    Route::apiResource('rutinas', RutinaController::class);
    Route::apiResource('ejercicios', EjercicioController::class); 
    Route::apiResource('ingredientes', IngredienteController::class);
    Route::apiResource('usuarios', UsuariosController::class);
    Route::apiResource('citas', CitaController::class)->except(['store']);
    Route::get('/me', [AuthController::class, 'me']);
  
    Route::post('/logout', [AuthController::class, 'logout']);
});