<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rutina; // CAMBIO: Singular (convención Laravel)
use Illuminate\Http\Request;

class RutinaController extends Controller
{
    /**
     * Lista todas las rutinas disponibles con sus ejercicios.
     */
    public function index()
    {
        // Cargamos los ejercicios que pertenecen a cada rutina
        return response()->json(Rutina::with('ejercicios')->get(), 200);
    }

    /**
     * Crea una nueva rutina (el contenedor).
     */
    public function store(Request $request)
    {
        // 1. Validamos tanto el nombre como el array de ejercicios
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'ejercicios' => 'required|array', // Validamos que llegue un array
            'ejercicios.*' => 'exists:ejercicios,id' // Validamos que cada ID exista
        ]);

        // 2. Creamos la rutina
        $rutina = Rutina::create([
            'nombre' => $request->nombre
        ]);

        // 3. Asociamos los ejercicios mediante el método attach o sync
        // Usamos sync para asegurar que se guarde la relación en la tabla pivote
        $rutina->ejercicios()->sync($request->ejercicios);

        return response()->json($rutina, 201);
    }

    /**
     * Muestra una rutina específica y los ejercicios que la componen.
     */
    public function show($id)
    {
        // Usamos findOrFail para simplificar el código
        $rutina = Rutina::with('ejercicios')->findOrFail($id);

        return response()->json($rutina, 200);
    }

    /**
     * Método Especial: Añadir un ejercicio a la rutina.
     */
    public function agregarEjercicio(Request $request, $rutinaId)
    {
        $rutina = Rutina::findOrFail($rutinaId);

        $request->validate([
            'ejercicio_id' => 'required|exists:ejercicios,id',
            'series' => 'required|integer|min:1',
            'repeticiones' => 'nullable|integer',
            'duracion_segundos' => 'nullable|integer',
            'notas' => 'nullable|string'
        ]);

        // Guardamos en la tabla intermedia 'ejercicio_rutina'
        $rutina->ejercicios()->attach($request->ejercicio_id, [
            'series' => $request->series,
            'repeticiones' => $request->repeticiones,
            'duracion_segundos' => $request->duracion_segundos,
            'notas' => $request->notas
        ]);

        return response()->json(['message' => 'Ejercicio añadido a la rutina'], 200);
    }

    /**
     * Actualizar nombre o descripción de la rutina.
     */
    public function update(Request $request, $id)
    {
        $rutina = Rutina::findOrFail($id);
        $rutina->update($request->all());

        return response()->json($rutina, 200);
    }

    /**
     * Eliminar una rutina.
     */
    public function destroy($id)
    {
        $rutina = Rutina::findOrFail($id);
        $rutina->delete();

        return response()->json(['message' => 'Rutina eliminada'], 200);
    }
}