<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comida;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ComidaController extends Controller
{
    public function index(): JsonResponse
{
    // Quitamos la relación 'ingredientes' para aislar el error
    return response()->json(Comida::all(), 200);
}

    public function store(Request $request): JsonResponse
{
    $request->validate([
        'nombre' => 'required|string|max:255',
        'ingredientes' => 'required|array',
        'ingredientes.*.id' => 'required|exists:ingredientes,id',
        'ingredientes.*.cantidad' => 'required|numeric',
    ]);

    return DB::transaction(function () use ($request) {
        // 1. Crear la comida (sin calorías todavía)
        $comida = Comida::create($request->only(['nombre', 'receta', 'descripcion', 'imagen']));

        $totalCalorias = 0;

        foreach ($request->ingredientes as $ingData) {
            // Buscamos el ingrediente para obtener su valor nutricional
            $ingrediente = \App\Models\Ingrediente::findOrFail($ingData['id']);
            
            // Cálculo: (Kcal por 100g / 100) * cantidad en gramos
            $totalCalorias += ($ingrediente->kcal_por_100g / 100) * $ingData['cantidad'];

            // 2. Vincular el ingrediente
            $comida->ingredientes()->attach($ingData['id'], [
                'cantidad' => $ingData['cantidad'],
                'unidad' => $ingData['unidad'] ?? 'g'
            ]);
        }

        // 3. Actualizamos la comida con el total calculado
        $comida->update(['calorias' => round($totalCalorias)]);

        return response()->json(['message' => 'Comida creada con éxito', 'data' => $comida], 201);
    });
}

    public function show($id): JsonResponse
    {
        return response()->json(Comida::with('ingredientes')->findOrFail($id), 200);
    }
}