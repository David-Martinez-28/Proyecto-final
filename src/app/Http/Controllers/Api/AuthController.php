<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Paciente;
use App\Models\Dietista;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // 1. Validaciones dinámicas
        $request->validate([
            'name'         => 'required|string|max:255',
            'email'        => 'required|string|email|max:255|unique:users',
            'password'     => 'required|string|min:8',
            'role'         => 'required|in:dietista,paciente',
            'especialidad' => 'required_if:role,dietista|string',
            'nick'         => 'required_if:role,paciente|string|unique:pacientes,nick',
        ]);

        // 2. SEGURIDAD: Si intentan crear un paciente, verificamos al dietista PRIMERO
        $dietistaId = null;
        if ($request->role === 'paciente') {
            // Usamos auth('sanctum') para forzar la lectura del token en una ruta pública
            $userLogueado = auth('sanctum')->user();
            
            if (!$userLogueado || $userLogueado->role !== 'dietista') {
                throw ValidationException::withMessages([
                    'error' => ['Acceso denegado. Solo un dietista puede registrar pacientes.'],
                ]);
            }
            $dietistaId = $userLogueado->dietista->id;
        }

        // 3. Ahora sí, creamos el usuario base de forma segura
        $user = clone new User(); // Evitamos conflictos si tu modelo se llama distinto
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' =>Hash::make($request->password),
            'role'     => $request->role,
            'avatar'   => 'https://ui-avatars.com/api/?background=random&color=fff&name=' . urlencode($request->name),
        ]);

        // 4. Crear el perfil específico
        if ($request->role === 'dietista') {
            Dietista::create([
                'user_id'       => $user->id,
                'especialidad'  => $request->especialidad ?? 'General',
                'num_colegiado' => 'TEMP-' . time(),
            ]);
        } else if ($request->role === 'paciente') {
            Paciente::create([
                'user_id'     => $user->id,
                'dietista_id' => $dietistaId, // Ya lo hemos validado arriba
                'nick'        => $request->nick,
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user->load($request->role === 'dietista' ? 'dietista' : 'paciente'),
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        // Manejo apropiado de errores y gestión de excepciones
        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales son incorrectas.'],
            ]);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user->load($user->role === 'paciente' ? 'paciente' : 'dietista'),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente'
        ]);
    }

    /**
     * Subida y actualización de la foto de perfil (Avatar).
     */
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $user = auth()->user();

        if ($request->hasFile('avatar')) {
            // Opcional: Si el usuario ya tenía una foto, la borramos para ahorrar espacio
            if ($user->avatar) {
                $oldPath = str_replace(url('storage') . '/', '', $user->avatar);
                Storage::disk('public')->delete($oldPath);
            }

            // Guardamos la nueva foto en storage/app/public/avatars
            $path = $request->file('avatar')->store('avatars', 'public');
            
            // Guardamos la URL pública en la base de datos
            $user->avatar = url('storage/' . $path);
            $user->save();
        }

        return response()->json([
            'message' => 'Foto actualizada correctamente',
            'user'    => $user->load($user->role === 'paciente' ? 'paciente' : 'dietista')
        ]);
    }
}