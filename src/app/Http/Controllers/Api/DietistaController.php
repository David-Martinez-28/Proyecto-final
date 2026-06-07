<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dietista;
use App\Models\Paciente;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DietistaController extends Controller
{
    /**
     * Listar todos los dietistas con su información de usuario base.
     */
    public function index(): JsonResponse
    {
        $user = auth()->user();

      
        if ($user->role !== 'dietista' || !$user->dietista) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        
        $pacientes = $user->dietista->pacientes()->with('user')->get();

        return response()->json($pacientes, 200);
    }

    /**
     * Ver perfil detallado + sus pacientes.
     */
    public function show(Paciente $paciente): JsonResponse
    {
        $dietista = auth()->user()->dietista;

        
        if ($paciente->dietista_id !== $dietista->id) {
            return response()->json(['error' => 'No tienes permiso para ver este paciente'], 403);
        }

        return response()->json($paciente->load(['user', 'comidas', 'rutinas.ejercicios']), 200);
    }

    /**
     * Ver específicamente la lista de pacientes de este dietista.
     */
    public function pacientes(Dietista $dietista): JsonResponse
    {
        // Esto devolverá los nicks y datos de salud de sus pacientes
        return response()->json($dietista->pacientes()->with('user')->get(), 200);
    }

    /**
     * Actualizar datos del perfil (Especialidad, num_colegiado, etc.)
     */
    public function update(Request $request, Dietista $dietista): JsonResponse
{
    
    $request->validate([
        'name' => 'sometimes|string|max:255',
        'num_colegiado' => 'sometimes|string',
        'especialidad' => 'sometimes|string',
        'password' => 'nullable|min:8|confirmed',
    ]);

    // 2. Actualizar datos de la tabla 'dietistas'
    $dietista->update($request->only(['num_colegiado', 'especialidad']));

   
    $user = $dietista->user;
    
    if ($request->has('name')) {
        $user->name = $request->name;
    }

    
    if ($request->filled('password')) {
        $user->password = Hash::make($request->password);
    }

    $user->save();

    // 5. Retornar respuesta cargando la relación
    return response()->json($dietista->load('user'), 200);
}

    /**
     * Eliminar perfil de dietista.
     */
    public function destroy(Dietista $dietista): JsonResponse
    {
        
        $user = $dietista->user;
        $dietista->delete();
        $user->delete();

        return response()->json(['message' => 'Dietista y cuenta de usuario eliminados'], 200);
    }

}