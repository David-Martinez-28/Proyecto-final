<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DietistaController;
use App\Http\Controllers\Api\PacienteController;
use App\Http\Controllers\Api\ComidaController;
use App\Http\Controllers\Api\RutinaController;
use App\Http\Controllers\Api\IngredienteController;

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
    
    // Perfil del usuario autenticado (útil para el estado global de React)
    Route::get('/user', function (Request $request) {
        return $request->user()->load($request->user()->role === 'paciente' ? 'paciente' : 'dietista');
    });

    // Recursos API
    Route::apiResource('dietistas', DietistaController::class);
    Route::apiResource('pacientes', PacienteController::class);
    Route::apiResource('comidas', ComidaController::class);
    Route::apiResource('rutinas', RutinaController::class);
    

    // Rutas de asignación lógica
    Route::post('/pacientes/{paciente}/asignar-comida', [PacienteController::class, 'asignarComida']);
    Route::post('/rutinas/{rutina}/agregar-ejercicio', [RutinaController::class, 'agregarEjercicio']);
    Route::post('/comidas/{comida}/agregar-ingrediente', [ComidaController::class, 'agregarIngrediente']);

    // EL CORAZÓN DEL FRONTEND: El plan del paciente logueado
    Route::get('/mi-plan', [PacienteController::class, 'obtenerPlan']);

    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);
});