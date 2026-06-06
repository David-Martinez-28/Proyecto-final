<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comida;
use App\Models\Ingrediente;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ComidaController extends Controller
{
    /**
     * Devuelve el catálogo completo de platos con sus ingredientes
     */
    public function index(): JsonResponse
    {
        $comidas = Comida::with('ingredientes')->get();

        $comidas->each(function ($comida) {
            if (!empty($comida->imagen) && !str_starts_with($comida->imagen, 'http')) {
                $comida->imagen = asset('storage/' . $comida->imagen);
            }
        });

        return response()->json([
            'status' => 'success',
            'data'   => $comidas
        ], 200);
    }

    /**
     * Almacena una nueva comida procesando FormData, imágenes y JSON stringificado
     */
    public function store(Request $request): JsonResponse
    {
        // 1. Decodificación limpia del String de ingredientes que viene de React
        if ($request->has('ingredientes') && is_string($request->input('ingredientes'))) {
            $decodificado = json_decode($request->input('ingredientes'), true);
            $request->merge([
                'ingredientes' => is_array($decodificado) ? $decodificado : []
            ]);
        }

        // 💡 CAMBIO CRÍTICO: Si no es un archivo válido, nos aseguramos de que no sea un string de texto
        if (!$request->hasFile('imagen') || !$request->file('imagen')->isValid()) {
            $request->request->remove('imagen');
        }

        // 2. Validación manual interna
        $validator = \Validator::make($request->all(), [
            'nombre' => 'required|string|max:255',
            'receta' => 'nullable|string',
            'imagen' => 'sometimes|image|mimes:jpeg,png,jpg,webp|max:2048', // Simplificado para que sea más tolerante
            'ingredientes' => 'required|array|min:1',
            'ingredientes.*.id' => 'required|exists:ingredientes,id',
            'ingredientes.*.cantidad' => 'required|numeric|min:0.1',
            'ingredientes.*.unidad' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        // 3. Ejecución segura de la inserción física
        try {
            return DB::transaction(function () use ($request) {
                
                $rutaImagen = null;
                if ($request->hasFile('imagen')) {
                    // 💡 MEJORA EN BD: Guardamos la ruta relativa 'comidas/archivo.jpg' 
                    // Tu método index() ya se encarga de transformarla en http://... al leerla
                    $rutaImagen = $request->file('imagen')->store('comidas', 'public');
                }

                $comida = Comida::create([
                    'nombre' => $request->input('nombre'),
                    'receta' => $request->input('receta'),
                    'imagen' => $rutaImagen,
                ]);

                $totalCalorias = 0;

                foreach ($request->input('ingredientes') as $ingData) {
                    $ingrediente = Ingrediente::findOrFail($ingData['id']);
                    
                    $totalCalorias += ($ingrediente->calorias / 100) * $ingData['cantidad'];

                    $comida->ingredientes()->attach($ingData['id'], [
                        'cantidad' => $ingData['cantidad'],
                        'unidad' => $ingData['unidad'] ?? 'g'
                    ]);
                }

                $comida->update(['calorias' => round($totalCalorias)]);

                // Cargamos la relación para devolver la respuesta estructurada
                $comidaFinal = $comida->load('ingredientes');

                // 💡 Formateamos la imagen también en la respuesta del 201 para que React la pinte al instante
                if (!empty($comidaFinal->imagen)) {
                    $comidaFinal->imagen = asset('storage/' . $comidaFinal->imagen);
                }

                return response()->json([
                    'status' => 'success',
                    'message' => 'Comida creada con éxito',
                    'data' => $comidaFinal
                ], 201);
            });

        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error crítico al procesar la base de datos',
                'error_real' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Muestra una comida específica con sus ingredientes
     */
    public function show($id): JsonResponse
    {
        $comida = Comida::with('ingredientes')->findOrFail($id);
        return response()->json($comida, 200);
    }
}