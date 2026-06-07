<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ingrediente;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class IngredienteController extends Controller
{
    /**
     * Devuelve todos los ingredientes DEL DIETISTA AUTENTICADO.
     */
    public function index(): JsonResponse
    {
        try {
            // 🔥 CAMBIO: Filtramos por el propietario
            $dietistaId = auth()->user()->dietista->id;
            $ingredientes = Ingrediente::where('dietista_id', $dietistaId)->get();
            
            return response()->json($ingredientes, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al obtener ingredientes', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Crea un nuevo ingrediente asignándolo al dietista actual.
     */
    public function store(Request $request): JsonResponse
    {
        // 🔥 CAMBIO: Actualizados los campos para que coincidan con tu migración exacta
        $validated = $request->validate([
            'nombre'        => 'required|string|max:255',
            'calorias'      => 'required|numeric|min:0',
            'proteinas'     => 'nullable|numeric|min:0',
            'grasas'        => 'nullable|numeric|min:0',
            'carbohidratos' => 'nullable|numeric|min:0',
        ]);

        try {
            // 🔥 CAMBIO: Asignamos el ingrediente al dietista
            $validated['dietista_id'] = auth()->user()->dietista->id;
            
            $ingrediente = Ingrediente::create($validated);
            
            return response()->json($ingrediente, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al crear ingrediente', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Muestra un ingrediente específico (solo si le pertenece).
     */
    public function show($id): JsonResponse
    {
        try {
            $dietistaId = auth()->user()->dietista->id;
            
            // 🔥 CAMBIO: Buscamos verificando también el propietario
            $ingrediente = Ingrediente::where('id', $id)->where('dietista_id', $dietistaId)->first();

            if (!$ingrediente) {
                return response()->json(['message' => 'Ingrediente no encontrado o sin permisos'], 404);
            }

            return response()->json($ingrediente, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al buscar el ingrediente'], 500);
        }
    }

    /**
     * Actualiza un ingrediente (solo si le pertenece).
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $dietistaId = auth()->user()->dietista->id;
            
            $ingrediente = Ingrediente::where('id', $id)->where('dietista_id', $dietistaId)->first();

            if (!$ingrediente) {
                return response()->json(['message' => 'Ingrediente no encontrado o sin permisos'], 404);
            }

            $request->validate([
                'nombre'        => 'sometimes|required|string|max:255',
                'calorias'      => 'sometimes|required|numeric|min:0',
                'proteinas'     => 'nullable|numeric|min:0',
                'grasas'        => 'nullable|numeric|min:0',
                'carbohidratos' => 'nullable|numeric|min:0',
            ]);

            // 🔥 CAMBIO: Evitamos que se pueda inyectar un cambio de dueño
            $ingrediente->update($request->except('dietista_id'));

            return response()->json($ingrediente, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al actualizar', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Elimina un ingrediente (solo si le pertenece).
     */
    public function destroy($id): JsonResponse
    {
        try {
            $dietistaId = auth()->user()->dietista->id;
            
            // 🔥 CAMBIO: Verificamos propiedad antes de eliminar
            $ingrediente = Ingrediente::where('id', $id)->where('dietista_id', $dietistaId)->first();

            if (!$ingrediente) {
                return response()->json(['message' => 'Ingrediente no encontrado o sin permisos'], 404);
            }

            $ingrediente->delete();
            return response()->json(['message' => 'Ingrediente eliminado'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al eliminar', 'error' => $e->getMessage()], 500);
        }
    }
}