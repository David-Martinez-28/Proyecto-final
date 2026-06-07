<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Paciente;
use App\Models\Estadistica;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use \Illuminate\Support\Facades\DB;
class PacienteController extends Controller
{
    /**
     * Lista de pacientes del dietista autenticado.
     */
    public function index()
    {
        // 1. Obtenemos el usuario que tiene la sesión iniciada (el dietista)
        $user = auth()->user();

        // 2. Verificamos que sea un dietista
        if ($user->role !== 'dietista') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        // 3. FILTRO CRÍTICO: 
        // Solo traemos los pacientes cuyo 'dietista_id' coincida con el perfil del usuario logueado
        $misPacientes = Paciente::where('dietista_id', $user->dietista->id)
            ->with('user') // Cargamos la relación del usuario para ver nombre/email/avatar
            ->get();

        return response()->json($misPacientes);
    }

    public function update(Request $request, Paciente $paciente): JsonResponse
{
    // 1. Validaciones
    $request->validate([
        'name' => 'sometimes|string|max:255',
        'password' => 'nullable|min:8|confirmed',
        // Si tienes campos específicos de paciente, valídalos aquí:
        // 'objetivo' => 'sometimes|string',
    ]);

    // 2. Actualizar datos de la tabla 'pacientes'
    // $paciente->update($request->only(['objetivo']));

    // 3. Actualizar datos de la tabla 'users'
    $user = $paciente->user;
    
    if ($request->has('name')) {
        $user->name = $request->name;
    }

    if ($request->filled('password')) {
        $user->password = Hash::make($request->password);
    }

    $user->save();

    // 4. Retornar el objeto cargado con la relación
    return response()->json($paciente->load('user'), 200);
}

    /**
     * Mostrar el detalle de un paciente específico (Controlado por Dietista propietario).
     */
    public function show(Paciente $paciente)
{
    if ($paciente->dietista_id !== auth()->user()->dietista->id) {
        return response()->json(['error' => 'No autorizado'], 403);
    }

    return response()->json([
        'status' => 'success',
        'data' => $paciente->load([
            'user',
            'comidas' => function ($q) {
                $q->withPivot('dia_semana', 'momento', 'fecha_inicio', 'fecha_fin', 'estado');
            },
            
            'rutinas' => function ($q) {
                $q->withPivot('fecha_inicio', 'fecha_fin');
            }
        ])
    ]);
}

    /**
     * Obtener el plan del paciente autenticado (Ruta pública para el rol Paciente: /api/mi-plan).
     */
    /**
     * Obtener el plan del paciente autenticado (Ruta pública para el rol Paciente: /api/mi-plan).
     */
   public function obtenerPlan()
{
    $user = auth()->user();

    if (!$user || $user->role !== 'paciente' || !$user->paciente) {
        return response()->json(['error' => 'Perfil de paciente no encontrado o no autorizado'], 404);
    }

    try {
        $plan = $user->paciente->load([
            'comidas' => function ($q) {
                $q->withPivot('dia_semana', 'momento', 'estado');
                $q->orderBy('dia_semana', 'asc');
            },
            'comidas.ingredientes' => function ($query) {
                
            },
            'rutinas' => function ($q) {
                $q->withPivot('fecha_inicio', 'fecha_fin');
            },
            'rutinas.ejercicios',
            'dietista.user' => function ($query) {
                $query->select('id', 'name', 'email');
            },
            'estadisticas',
            'user' 
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $plan
        ], 200);

    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Error al procesar el plan en la base de datos de NutriPanel',
            'error_sql' => $e->getMessage(),
            'linea' => $e->getLine()
        ], 500);
    }
}

    /**
     * Asignar una comida al plan (Verificando propiedad).
     */
    public function asignarComida(Request $request, Paciente $paciente)
    {
        // REQUISITO DE SEGURIDAD: Validar que el paciente pertenezca al dietista autenticado
        if ($paciente->dietista_id !== auth()->user()->dietista->id) {
            return response()->json(['error' => 'No autorizado para modificar el plan de este paciente.'], 403);
        }

        $request->validate([
            'comida_id' => 'required|exists:comidas,id',
            'dia_semana' => 'required|integer|between:0,6',
            'momento' => 'required|in:desayuno,almuerzo,comida,merienda,cena',
        ]);

        // Attach guardará los datos en la tabla intermedia paciente_comida
        $paciente->comidas()->attach($request->comida_id, [
            'dia_semana' => $request->dia_semana,
            'momento' => $request->momento,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Comida asignada correctamente al plan'
        ]);
    }

    /**
     * Eliminar la ficha de un paciente (Verificando propiedad).
     */
    public function destroy(Paciente $paciente)
    {
        // REQUISITO DE SEGURIDAD: Validar que el paciente pertenezca al dietista autenticado
        if ($paciente->dietista_id !== auth()->user()->dietista->id) {
            return response()->json(['error' => 'No autorizado para eliminar este paciente.'], 403);
        }

        $paciente->delete();
        return response()->json(null, 204);
    }
    /**
     * Elimina un plato específico de una celda del plan semanal.
     */
    /**
     * Elimina un plato específico de una celda del plan semanal.
     */
    public function quitarComida(Request $request, $id)
    {
        try {
            // 1. Validamos los datos que llegan de React
            $request->validate([
                'dia_semana' => 'required|integer|between:0,6',
                'momento' => 'required|in:desayuno,almuerzo,comida,merienda,cena',
            ]);

            $paciente = Paciente::findOrFail($id);

            // 2. Seguridad: ¿Existe el usuario logueado y es su dietista?
            if (!auth()->user() || $paciente->dietista_id !== auth()->user()->dietista->id) {
                return response()->json(['error' => 'No autorizado o sesión expirada'], 403);
            }

            // 3. Borramos usando el nombre dinámico de la tabla pivote por si la llamaste distinto
            $tablaPivote = $paciente->comidas()->getTable();

            DB::table($tablaPivote)
                ->where('paciente_id', $paciente->id)
                ->where('dia_semana', $request->dia_semana)
                ->where('momento', $request->momento)
                ->delete();

            return response()->json(['message' => 'Plato eliminado correctamente']);

        } catch (\Exception $e) {
            // Si algo falla, le mandamos el error real a React para poder leerlo
            return response()->json([
                'message' => 'Error interno de Laravel',
                'error' => $e->getMessage(),
                'linea' => $e->getLine()
            ], 500);
        }
    }
    /**
     * Asignar un ejercicio a la rutina del paciente.
     */
    /**
     * Asignar un bloque de rutina a un paciente en unas fechas concretas.
     */
    /**
     * Asignar un ejercicio a la cuadrícula (Drag & Drop)
     */
    /**
     * Asignar un bloque de rutina a un paciente.
     * Usamos syncWithoutDetaching para evitar el error 500 por duplicados.
     */
    public function asignarRutina(Request $request, $id)
    {
        $request->validate([
            'rutina_id' => 'required|exists:rutinas,id',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
        ]);

        $paciente = Paciente::findOrFail($id);

        if ($paciente->dietista_id !== auth()->user()->dietista->id) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        try {
           
            $paciente->rutinas()->syncWithoutDetaching([
                $request->rutina_id => [
                    'fecha_inicio' => $request->fecha_inicio,
                    'fecha_fin' => $request->fecha_fin
                ]
            ]);

            return response()->json(['message' => 'Rutina asignada correctamente']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al asignar: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Quitar una rutina usando where para asegurar el borrado exacto.
     */
    public function quitarRutina($id, $rutinaId)
    {
        $paciente = Paciente::findOrFail($id);

        if ($paciente->dietista_id !== auth()->user()->dietista->id) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        // detach borra el registro de la tabla pivote
        $paciente->rutinas()->detach($rutinaId);

        return response()->json(['message' => 'Rutina desvinculada correctamente']);
    }

    public function archivarPlan($id)
    {
        $paciente = Paciente::findOrFail($id);

        if ($paciente->dietista_id !== auth()->user()->dietista->id) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        DB::table('paciente_comida')
            ->where('paciente_id', $paciente->id)
            ->where('estado', 'activa')
            ->update([
                'estado' => 'archivada',
                
                'fecha_fin' => now()->toDateString()
            ]);

        return response()->json(['message' => 'Dieta archivada. La cuadrícula está vacía para el nuevo plan.']);
    }
    public function guardarEstadistica(Request $request, $pacienteId = null)
    {
        $request->validate([
            'peso' => 'required|numeric',
            'altura' => 'required|numeric',
            'porcentaje_graso' => 'nullable|numeric',
            'masa_muscular' => 'nullable|numeric',
        ]);

        
        $paciente = $pacienteId 
            ? \App\Models\Paciente::findOrFail($pacienteId) 
            : $request->user()->paciente;

      
        if ($request->user()->role === 'dietista') {
            if ($paciente->dietista_id !== $request->user()->dietista->id) {
                return response()->json(['error' => 'No autorizado'], 403);
            }
        }

        // 3. Crear usando solo los datos validados (más seguro que all())
        $estadistica = $paciente->estadisticas()->create([
            'peso' => $request->peso,
            'altura' => $request->altura,
            'porcentaje_graso' => $request->porcentaje_graso,
            'masa_muscular' => $request->masa_muscular,
        ]);

        return response()->json([
            'status' => 'success', 
            'message' => 'Medidas registradas con éxito', 
            'data' => $estadistica
        ], 201);
    }
        // En UsuariosController o donde tengas la lógica de evolución
    public function getEstadisticasPaciente($id) 
    {
        try {
            $user = auth()->user();
            
            // Verificación de seguridad inicial
            if (!$user) {
                return response()->json(['error' => 'No autenticado'], 401);
            }

            // 1. Buscamos al paciente por ID
            $paciente = Paciente::findOrFail($id);

            // 2. Lógica de Seguridad evitando llamadas a objetos nulos
            if ($user->role === 'dietista') {
                // Validamos que la relación exista antes de pedir el ID
                if (!$user->dietista) {
                    return response()->json(['error' => 'El usuario es dietista pero no tiene un perfil asociado en la tabla dietistas.'], 400);
                }
                // Verificamos que el paciente pertenezca a este dietista
                if ($paciente->dietista_id !== $user->dietista->id) {
                    return response()->json(['error' => 'No autorizado para ver este paciente'], 403);
                }
            } elseif ($user->role === 'paciente') {
                // Validamos que la relación del paciente exista
                if (!$user->paciente) {
                    return response()->json(['error' => 'El usuario es paciente pero no tiene un registro asociado en la tabla pacientes.'], 400);
                }
                // Verificamos que el paciente solo intente ver sus propios datos
                if ($user->paciente->id !== (int)$id) {
                    return response()->json(['error' => 'No puedes ver la evolución de otros pacientes'], 403);
                }
            } else {
                return response()->json(['error' => 'Rol de usuario no reconocido'], 403);
            }

            // 3. Consulta a la base de datos
            // IMPORTANTE: Asegúrate de que arriba de este archivo tengas: use App\Models\Estadistica;
            // Si tu modelo se llama en plural (Estadisticas), cambia el nombre aquí abajo:
            $estadisticas = Estadistica::where('paciente_id', $id)
                ->orderBy('created_at', 'asc')
                ->get();

            return response()->json($estadisticas);

        } catch (\Exception $e) {
            // Si el código falla por cualquier motivo, capturamos el error y lo enviamos como JSON
            return response()->json([
                'error' => 'Error interno en el controlador de Laravel',
                'mensaje_error' => $e->getMessage(),
                'archivo' => $e->getFile(),
                'linea' => $e->getLine()
            ], 500);
        }
    }
}