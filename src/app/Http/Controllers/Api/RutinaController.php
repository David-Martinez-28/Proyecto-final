<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rutina;
use App\Models\Ejercicio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class RutinaController extends Controller
{
    public function index()
    {
        $dietistaId = auth()->user()->dietista->id;
        $rutinas = Rutina::with(['ejercicios' => function($query) {
            $query->withPivot('series', 'repeticiones', 'duracion_segundos', 'notas');
        }])->where('dietista_id', $dietistaId)->get();

        $rutinas->transform(function ($rutina) {
            if ($rutina->imagen) $rutina->imagen = asset('storage/' . $rutina->imagen);
            return $rutina;
        });

        return response()->json($rutinas, 200);
    }

    public function store(Request $request)
    {
        // Decodificación de ejercicios desde FormData
        if ($request->has('ejercicios') && is_string($request->input('ejercicios'))) {
            $request->merge(['ejercicios' => json_decode($request->input('ejercicios'), true)]);
        }

        $request->validate([
            'nombre' => 'required|string|max:255',
            'ejercicios' => 'nullable|array',
        ]);

        return DB::transaction(function () use ($request) {
            $dietistaId = auth()->user()->dietista->id;
            
            $rutina = Rutina::create([
                'nombre' => $request->nombre,
                'dietista_id' => $dietistaId,
            ]);

            if ($request->has('ejercicios')) {
                $syncData = [];
                foreach ($request->ejercicios as $ej) {
                    $syncData[$ej['id']] = [
                        'series' => $ej['series'] ?? 3,
                        'repeticiones' => $ej['repeticiones'] ?? 12,
                        'duracion_segundos' => $ej['duracion_segundos'] ?? 0
                    ];
                }
                $rutina->ejercicios()->sync($syncData);
            }

            return response()->json($rutina->load('ejercicios'), 201);
        });
    }

    public function update(Request $request, $id)
    {
        $dietistaId = auth()->user()->dietista->id;
        $rutina = Rutina::where('id', $id)->where('dietista_id', $dietistaId)->first();

        if (!$rutina) return response()->json(['message' => 'Rutina no encontrada'], 404);

        $request->validate(['nombre' => 'sometimes|required|string|max:255']);

        $rutina->update($request->only(['nombre', 'descripcion']));

        // 🔥 AQUÍ ESTÁ LA CLAVE: Procesar array de objetos con métricas
        if ($request->has('ejercicios')) {
            $syncData = [];
            foreach ($request->ejercicios as $ej) {
                // $ej ahora es un objeto/array con id, series, repeticiones, duracion_segundos
                $syncData[$ej['id']] = [
                    'series' => $ej['series'] ?? 0,
                    'repeticiones' => $ej['repeticiones'] ?? 0,
                    'duracion_segundos' => $ej['duracion_segundos'] ?? 0,
                ];
            }
            $rutina->ejercicios()->sync($syncData);
        }

        return response()->json($rutina->load('ejercicios'), 200);
    }

    public function destroy($id)
    {
        $dietistaId = auth()->user()->dietista->id;
        $rutina = Rutina::where('id', $id)->where('dietista_id', $dietistaId)->first();
        if (!$rutina) return response()->json(['message' => 'No encontrada'], 404);
        
        $rutina->delete();
        return response()->json(['message' => 'Eliminada'], 200);
    }
}