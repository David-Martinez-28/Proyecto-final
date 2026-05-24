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

        // Verificamos que el usuario logueado sea un dietista
        if ($user->role !== 'dietista' || !$user->dietista) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        // TRAEMOS SOLO los pacientes que pertenecen a ESTE dietista
        $pacientes = $user->dietista->pacientes()->with('user')->get();

        return response()->json($pacientes, 200);
    }

    /**
     * Ver perfil detallado + sus pacientes.
     */
    public function show(Paciente $paciente): JsonResponse
    {
        $dietista = auth()->user()->dietista;

        // Si el paciente no pertenece al dietista logueado, denegamos el acceso
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
        $dietista->update($request->only(['num_colegiado', 'especialidad']));

        // Si también queremos actualizar el nombre en la tabla usuarios:
        if ($request->has('name')) {
            $dietista->user->update(['name' => $request->name]);
        }

        return response()->json($dietista->load('user'), 200);
    }

    /**
     * Eliminar perfil de dietista.
     */
    public function destroy(Dietista $dietista): JsonResponse
    {
        // Al eliminar al dietista, decidimos si eliminar también su cuenta de usuario
        $user = $dietista->user;
        $dietista->delete();
        $user->delete();

        return response()->json(['message' => 'Dietista y cuenta de usuario eliminados'], 200);
    }

}