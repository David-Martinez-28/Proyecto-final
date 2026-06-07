<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comida;
use App\Models\Ingrediente;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

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
    public function destroy($id)
{
    // 1. Buscamos la comida o lanzamos un error 404 si no existe
    $comida = Comida::findOrFail($id);

    // 2. Rompemos las relaciones en las tablas pivote antes de borrar
    // Esto limpia las referencias en cascada de forma manual en la base de datos
    $comida->ingredientes()->detach(); // Quita los ingredientes vinculados a este plato
    
    // Si tienes vinculada la comida a menús, planes o dietas, añade sus relaciones aquí:
    // $comida->menus()->detach();
    // $comida->dietas()->detach();

    // 3. Ahora que está completamente libre de ataduras en MySQL, la borramos sin error 500
    $comida->delete();

    return response()->json(['message' => 'Comida eliminada correctamente']);
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

        // Si no es un archivo válido, nos aseguramos de que no sea un string de texto
        if (!$request->hasFile('imagen') || !$request->file('imagen')->isValid()) {
            $request->request->remove('imagen');
        }

        // 2. Validación manual interna
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:255',
            'receta' => 'nullable|string',
            'imagen' => 'sometimes|image|mimes:jpeg,png,jpg,webp|max:2048', 
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
                    $rutaImagen = $request->file('imagen')->store('comidas', 'public');
                }

                // Verificamos de forma segura que el usuario tiene el perfil de dietista
                $usuario = auth()->user();
                if (!$usuario || !$usuario->dietista) {
                    abort(response()->json([
                        'status' => 'error',
                        'message' => 'Acceso denegado: El usuario activo no tiene un perfil de dietista válido configurado.'
                    ], 403));
                }
                
                $dietistaId = $usuario->dietista->id;

                $comida = Comida::create([
                    'nombre' => $request->input('nombre'),
                    'receta' => $request->input('receta'),
                    'imagen' => $rutaImagen,
                    'dietista_id' => $dietistaId, 
                ]);

                $totalCalorias = 0;

                foreach ($request->input('ingredientes') as $ingData) {
                    $ingrediente = Ingrediente::find($ingData['id']);
                    
                    if ($ingrediente) {
                        // Cálculo de calorías (proporcional por cada 100g/ml)
                        $totalCalorias += ($ingrediente->calorias / 100) * $ingData['cantidad'];

                        $comida->ingredientes()->attach($ingData['id'], [
                            'cantidad' => $ingData['cantidad'],
                            'unidad' => $ingData['unidad'] ?? 'g'
                        ]);
                    }
                }

                $comida->update(['calorias' => round($totalCalorias)]);

                // Cargamos la relación para devolver la respuesta estructurada
                $comidaFinal = $comida->load('ingredientes');

                // Formateamos la imagen en la respuesta para que React la pinte al instante
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
            // Registramos el error real en los logs del servidor para auditoría
            Log::error('Error al guardar comida: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Error crítico al procesar la base de datos',
                'error_real' => $e->getMessage()
            ], 500); 
        }
    }

    /**
     * Muestra una comida específica con sus ingredientes
     */
    public function show($id): JsonResponse
    {
        $comida = Comida::with('ingredientes')->findOrFail($id);
        
        if (!empty($comida->imagen) && !str_starts_with($comida->imagen, 'http')) {
            $comida->imagen = asset('storage/' . $comida->imagen);
        }

        return response()->json($comida, 200);
    }
    public function update(Request $request, $id)
{
    // 1. Buscamos la comida
    $comida = \App\Models\Comida::findOrFail($id);

    // 2. Validamos los datos (asegúrate de incluir los campos que recibes)
    $request->validate([
        'nombre' => 'required|string|max:255',
        'receta' => 'nullable|string',
        'imagen' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
    ]);

    // 3. Actualizamos campos de texto
    $comida->nombre = $request->nombre;
    $comida->receta = $request->receta;

    // 4. Gestión de imagen
    if ($request->hasFile('imagen')) {
        // Borrar antigua si existe
        if ($comida->imagen) {
            \Storage::disk('public')->delete(str_replace('/storage/', '', $comida->imagen));
        }
        $path = $request->file('imagen')->store('comidas', 'public');
        $comida->imagen = asset('storage/' . $path);
    }

    // 5. Gestión de ingredientes (si vienen en el JSON)
    if ($request->has('ingredientes')) {
        $ingredientes = json_decode($request->ingredientes, true);
        $syncData = [];
        foreach ($ingredientes as $ing) {
            $syncData[$ing['id']] = ['cantidad' => $ing['cantidad'], 'unidad' => $ing['unidad']];
        }
        $comida->ingredientes()->sync($syncData);
    }

    $comida->save();

    return response()->json(['message' => 'Comida actualizada con éxito', 'data' => $comida]);
}
}