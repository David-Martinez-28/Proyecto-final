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
        // 1. Validaciones
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:usuarios,email',
            'password' => 'required|string|min:8',
            'role'     => 'required|in:dietista,paciente',
            'nick'     => 'required_if:role,paciente|string|unique:pacientes,nick',
        ]);

        try {
            \DB::beginTransaction();

            $dietistaAutenticado = auth('sanctum')->user();

            // 2. Crear usuario base
            $user = User::create([
                'name'     => $request->name,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
                'role'     => $request->role,
                'imagen' => 'https://ui-avatars.com/api/?background=random&color=fff&name=' . urlencode($request->name),
            ]);
    
            // 3. Lógica según rol
            if ($request->role === 'paciente') {
                // Verificamos si el dietista tiene perfil creado
                if (!$dietistaAutenticado || !$dietistaAutenticado->dietista) {
                    \DB::rollBack();
                    return response()->json(['error' => 'El dietista logueado no tiene un perfil configurado.'], 400);
                }

                Paciente::create([
                    'user_id'     => $user->id,
                    'dietista_id' => $dietistaAutenticado->dietista->id,
                    'nick'        => $request->nick,
                ]);
            } else {
                Dietista::create([
                    'user_id'      => $user->id,
                    'especialidad' => $request->especialidad ?? 'General',
                    'num_colegiado' => $request->num_colegiado ?? null,
                ]);
            }

            \DB::commit();
            return response()->json(['message' => 'Usuario registrado con éxito', 'user' => $user], 201);

        } catch (\Exception $e) {
            \DB::rollBack();
            \Log::error('Error en registro: ' . $e->getMessage());
            return response()->json(['error' => 'Error interno al registrar el usuario'], 500);
        }
    }
   public function login(Request $request)
{
    $request->validate([
        'email'    => 'required|email',
        'password' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        throw ValidationException::withMessages([
            'email' => ['Las credenciales son incorrectas.'],
        ]);
    }

    $user->tokens()->delete();
    $token = $user->createToken('auth_token')->plainTextToken;

    // --- CORRECCIÓN AQUÍ ---
    // Determinamos la relación a cargar
    $relation = $user->role === 'paciente' ? 'paciente' : 'dietista';
    
    // Carga de forma segura
    $user->loadMissing($relation); 

    return response()->json([
        'access_token' => $token,
        'token_type'   => 'Bearer',
        'user'         => $user,
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

    public function me(Request $request)
{
    // Obtenemos el dietista relacionado al usuario autenticado
    $dietista = $request->user()->dietista;

    if (!$dietista) {
        return response()->json(['message' => 'Dietista no encontrado'], 404);
    }

    return response()->json($dietista);
}
}