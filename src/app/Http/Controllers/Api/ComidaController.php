<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comida;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ComidaController extends Controller
{
    /**
     * Lista todas las comidas con sus ingredientes.
     */
    public function index(): JsonResponse
    {
        // Cargamos la relación ingredientes con sus pivotes (cantidad y unidad)
        return response()->json(Comida::with('ingredientes')->get(), 200);
    }

    /**
     * Crea una nueva comida en el catálogo.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string'
        ]);

        $comida = Comida::create($validated);

        return response()->json($comida, 201);
    }

    /**
     * Muestra una comida específica.
     */
    public function show($id): JsonResponse
    {
        $comida = Comida::with('ingredientes')->findOrFail($id);
        return response()->json($comida, 200);
    }

    /**
     * Método Especial: Añadir ingredientes a una comida.
     * Usa la tabla pivote 'comida_ingrediente'.
     */
    public function agregarIngrediente(Request $request, $comidaId): JsonResponse
    {
        $comida = Comida::findOrFail($comidaId);

        $request->validate([
            'ingrediente_id' => 'required|exists:ingredientes,id',
            'cantidad' => 'required|numeric|min:0',
            'unidad' => 'required|string|max:20' 
        ]);

        // Usamos attach para insertar en la tabla intermedia
        $comida->ingredientes()->attach($request->ingrediente_id, [
            'cantidad' => $request->cantidad,
            'unidad' => $request->unidad
        ]);

        return response()->json(['message' => 'Ingrediente añadido a la comida'], 200);
    }

    /**
     * Actualizar datos básicos de la comida.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $comida = Comida::findOrFail($id);
        $comida->update($request->all());

        return response()->json($comida, 200);
    }

    /**
     * Eliminar una comida del catálogo.
     */
    public function destroy($id): JsonResponse
    {
        $comida = Comida::findOrFail($id);
        $comida->delete();

        return response()->json(['message' => 'Comida eliminada'], 200);
    }
}