<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ejercicio;
use Illuminate\Http\Request;

class EjercicioController extends Controller
{
    /**
     * Devuelve el catálogo completo de ejercicios (GET /api/ejercicios)
     */
    public function index()
    {
        try {
            $ejercicios = Ejercicio::all();
            return response()->json(['status' => 'success', 'data' => $ejercicios], 200);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Error al cargar el catálogo', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Guarda un nuevo ejercicio en la base de datos (POST /api/ejercicios)
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre'         => 'required|string|max:255',
            'grupo_muscular' => 'nullable|string|max:255',
            // Puedes añadir aquí más validaciones si tu tabla tiene más campos (ej: descripcion, series, repeticiones)
        ]);

        try {
            $ejercicio = Ejercicio::create($request->all());

            return response()->json([
                'status'  => 'success',
                'message' => 'Ejercicio creado correctamente',
                'data'    => $ejercicio
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Error al crear el ejercicio', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Muestra la información de un ejercicio específico (GET /api/ejercicios/{id})
     */
    public function show($id)
    {
        $ejercicio = Ejercicio::find($id);

        if (!$ejercicio) {
            return response()->json(['status' => 'error', 'message' => 'Ejercicio no encontrado'], 404);
        }

        return response()->json(['status' => 'success', 'data' => $ejercicio], 200);
    }

    /**
     * Actualiza los datos de un ejercicio existente (PUT /api/ejercicios/{id})
     */
    public function update(Request $request, $id)
    {
        $ejercicio = Ejercicio::find($id);

        if (!$ejercicio) {
            return response()->json(['status' => 'error', 'message' => 'Ejercicio no encontrado'], 404);
        }

        $request->validate([
            'nombre'         => 'sometimes|required|string|max:255',
            'grupo_muscular' => 'nullable|string|max:255',
        ]);

        try {
            $ejercicio->update($request->all());

            return response()->json([
                'status'  => 'success',
                'message' => 'Ejercicio actualizado correctamente',
                'data'    => $ejercicio
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Error al actualizar', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Elimina un ejercicio del catálogo (DELETE /api/ejercicios/{id})
     */
    public function destroy($id)
    {
        $ejercicio = Ejercicio::find($id);

        if (!$ejercicio) {
            return response()->json(['status' => 'error', 'message' => 'Ejercicio no encontrado'], 404);
        }

        try {
            $ejercicio->delete();

            return response()->json([
                'status'  => 'success',
                'message' => 'Ejercicio eliminado correctamente'
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Error al eliminar', 'error' => $e->getMessage()], 500);
        }
    }
}