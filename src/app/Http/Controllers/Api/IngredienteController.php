<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ingrediente;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class IngredienteController extends Controller
{
    /**
     * Devuelve todos los ingredientes del catálogo.
     */
    public function index(): JsonResponse
    {
        try {
            $ingredientes = Ingrediente::all();
            return response()->json($ingredientes, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al obtener ingredientes', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Crea un nuevo ingrediente en el catálogo.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'kcal_por_100g' => 'required|numeric',
        ]);

        try {
            $ingrediente = Ingrediente::create($validated);
            return response()->json($ingrediente, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al crear ingrediente', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Muestra un ingrediente específico.
     */
    public function show($id): JsonResponse
    {
        try {
            $ingrediente = Ingrediente::findOrFail($id);
            return response()->json($ingrediente, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Ingrediente no encontrado'], 404);
        }
    }

    /**
     * Actualiza un ingrediente.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $ingrediente = Ingrediente::findOrFail($id);
        $ingrediente->update($request->all());

        return response()->json($ingrediente, 200);
    }

    /**
     * Elimina un ingrediente.
     */
    public function destroy($id): JsonResponse
    {
        try {
            $ingrediente = Ingrediente::findOrFail($id);
            $ingrediente->delete();
            return response()->json(['message' => 'Ingrediente eliminado'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al eliminar'], 500);
        }
    }
}