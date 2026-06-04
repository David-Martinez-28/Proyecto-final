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
    // Rutas de Citas
    Route::post('/citas', [CitaController::class, 'store']); // Paciente pide cita
    Route::get('/dietista/mis-citas', [CitaController::class, 'misCitas']); // Dietista ve citas
    Route::post('/citas/{cita}/estado', [CitaController::class, 'actualizarEstado']); // Dietista actualiza
    // Perfil del usuario autenticado
    Route::get('/user', function (Request $request) {
        return $request->user()->load($request->user()->role === 'paciente' ? 'paciente' : 'dietista');
    });
    // Rutas de estadísticas
    // Para guardar (la que ya tenías)
    Route::post('/pacientes/estadisticas/{id?}', [PacienteController::class, 'guardarEstadistica']);

    // --- AÑADE ESTA LÍNEA PARA PODER LEERLAS Y VER EL GRÁFICO ---
    Route::get('/paciente/{id}/estadisticas', [PacienteController::class, 'getEstadisticasPaciente']);

    // Rutas de estadísticas
    // Para el paciente (propia) y para el dietista (especificando ID)
    Route::post('/pacientes/estadisticas/{id?}', [PacienteController::class, 'guardarEstadistica']);
    // Subida de foto de perfil
    Route::post('/user/avatar', [AuthController::class, 'uploadAvatar']);

    // Recursos API
    Route::apiResource('dietistas', DietistaController::class);
    Route::apiResource('pacientes', PacienteController::class);
    Route::apiResource('comidas', ComidaController::class);
    Route::apiResource('rutinas', RutinaController::class);
    Route::apiResource('ejercicios', EjercicioController::class); // Catálogo de ejercicios
    Route::apiResource('ingredientes', IngredienteController::class);
    Route::apiResource('citas', CitaController::class);
    Route::apiResource('usuarios', UsuariosController::class);
    // --- ASIGNACIÓN DE RUTINAS (Bloques enteros) ---
    Route::post('/pacientes/{id}/asignar-rutina', [PacienteController::class, 'asignarRutina']);
    Route::delete('/pacientes/{id}/quitar-rutina/{rutina_id}', [PacienteController::class, 'quitarRutina']);
    
    // --- ASIGNACIÓN DE EJERCICIOS EN LA CUADRÍCULA (Drag & Drop) 👇 AQUÍ ESTABAN LOS AUSENTES ---
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