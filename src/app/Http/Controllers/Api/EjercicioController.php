<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ejercicio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class EjercicioController extends Controller
{
    /**
     * Devuelve el catálogo de ejercicios DEL DIETISTA AUTENTICADO.
     */
    public function index()
    {
        try {
            $dietistaId = auth()->user()->dietista->id;
            $ejercicios = Ejercicio::where('dietista_id', $dietistaId)->get();
            
            // Transformamos la ruta de la imagen a una URL absoluta para React
            $ejercicios->transform(function ($ejercicio) {
                if ($ejercicio->imagen) {
                    $ejercicio->imagen = asset('storage/' . $ejercicio->imagen);
                }
                return $ejercicio;
            });

            return response()->json(['status' => 'success', 'data' => $ejercicios], 200);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Error al cargar el catálogo', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Guarda un nuevo ejercicio con su imagen.
     */
    public function store(Request $request)
    {
        // Limpiamos el input por si llega un archivo corrupto o en formato string desde FormData
        if (!$request->hasFile('imagen') || !$request->file('imagen')->isValid()) {
            $request->request->remove('imagen');
        }
        \Log::info($request->all()); // Log de todos los datos
    if ($request->hasFile('imagen')) {
        \Log::info('Archivo recibido: ' . $request->file('imagen')->getClientOriginalName());
    } else {
        \Log::warning('No se recibió ninguna imagen');
    }

        $request->validate([
            'nombre'         => 'required|string|max:255',
            'grupo_muscular' => 'required|string|max:255',
            'descripcion'    => 'nullable|string',
            'imagen'         => 'sometimes|image|mimes:jpeg,png,jpg,webp,gif|max:2048', // Permitimos GIF por si quieres animaciones
        ]);

        try {
            $data = $request->except('imagen');
            $data['dietista_id'] = auth()->user()->dietista->id;

            // Guardamos la imagen en storage/app/public/ejercicios
            if ($request->hasFile('imagen')) {
                $data['imagen'] = $request->file('imagen')->store('ejercicios', 'public');
            }

            $ejercicio = Ejercicio::create($data);

            // Formateamos para la respuesta instantánea
            if ($ejercicio->imagen) {
                $ejercicio->imagen = asset('storage/' . $ejercicio->imagen);
            }

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
     * Muestra un ejercicio específico.
     */
    public function show($id)
    {
        $dietistaId = auth()->user()->dietista->id;
        
        $ejercicio = Ejercicio::where('id', $id)->where('dietista_id', $dietistaId)->first();

        if (!$ejercicio) {
            return response()->json(['status' => 'error', 'message' => 'Ejercicio no encontrado o no tienes permiso'], 404);
        }

        if ($ejercicio->imagen) {
            $ejercicio->imagen = asset('storage/' . $ejercicio->imagen);
        }

        return response()->json(['status' => 'success', 'data' => $ejercicio], 200);
    }

    /**
     * Actualiza un ejercicio y su imagen.
     */
    public function update(Request $request, $id)
{
    $dietistaId = auth()->user()->dietista->id;
    $ejercicio = Ejercicio::where('id', $id)->where('dietista_id', $dietistaId)->first();

    if (!$ejercicio) {
        return response()->json(['status' => 'error', 'message' => 'Ejercicio no encontrado'], 404);
    }

    $request->validate([
        'nombre' => 'sometimes|required|string|max:255',
        'grupo_muscular' => 'nullable|string|max:255',
        'descripcion' => 'nullable|string',
        'imagen' => 'sometimes|image|mimes:jpeg,png,jpg,webp,gif|max:2048',
    ]);

    try {
        $data = $request->except(['dietista_id', 'imagen', '_method']);

        if ($request->hasFile('imagen')) {
            // Borramos la imagen física usando la ruta relativa almacenada
            if ($ejercicio->imagen) {
                \Storage::disk('public')->delete($ejercicio->imagen);
            }
            // Guardamos solo la ruta relativa
            $data['imagen'] = $request->file('imagen')->store('ejercicios', 'public');
        }

        $ejercicio->update($data);

        // Preparamos la respuesta: si hay imagen, le ponemos el asset
        $respuesta = $ejercicio->toArray();
        if ($ejercicio->imagen) {
            $respuesta['imagen'] = asset('storage/' . $ejercicio->imagen);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Ejercicio actualizado correctamente',
            'data'    => $respuesta
        ], 200);

    } catch (\Exception $e) {
        return response()->json(['status' => 'error', 'message' => 'Error al actualizar', 'error' => $e->getMessage()], 500);
    }
}

    /**
     * Elimina un ejercicio y limpia el disco duro.
     */
    public function destroy($id)
    {
        $dietistaId = auth()->user()->dietista->id;
        
        $ejercicio = Ejercicio::where('id', $id)->where('dietista_id', $dietistaId)->first();

        if (!$ejercicio) {
            return response()->json(['status' => 'error', 'message' => 'Ejercicio no encontrado o no tienes permiso'], 404);
        }

        try {
            // Borramos la imagen física para no acumular archivos basura en el servidor
            if ($ejercicio->imagen) {
                Storage::disk('public')->delete($ejercicio->imagen);
            }

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