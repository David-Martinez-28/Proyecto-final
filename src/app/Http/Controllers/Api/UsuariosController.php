<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UsuariosController extends Controller
{
    public function update(Request $request)
{
    $user = auth()->user();

    // 1. Validar solo los campos básicos de User primero
    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:usuarios,email,' . $user->id,
        'password' => 'nullable|min:8|confirmed',
        'imagen' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
    ]);

    // 2. Procesar Imagen (si existe)
    if ($request->hasFile('imagen')) {
        $path = $request->file('imagen')->store('avatars', 'public');
        $user->imagen = '/storage/' . $path;
    }

    // 3. Actualizar campos básicos
    $user->name = $request->name;
    $user->email = $request->email;
    if ($request->filled('password')) {
        $user->password = \Illuminate\Support\Facades\Hash::make($request->password);
    }
    $user->save();

    // 4. Actualizar relación - Filtrando para evitar errores de columna inexistente
    if ($user->role === 'dietista' && $user->dietista) {
        // Solo enviamos lo que realmente existe en la tabla dietistas
        $user->dietista->update($request->only(['especialidad', 'num_colegiado']));
    } elseif ($user->role === 'paciente' && $user->paciente) {
        $user->paciente->update($request->only(['nick']));
    }

    return response()->json([
        'message' => 'Perfil actualizado', 
        'user' => $user->load($user->role)
    ], 200);
}

    public function destroy(Request $request)
    {
        $user = $request->user();
        $user->tokens()->delete();
        $user->delete(); // Asegúrate de tener 'onDelete cascade' en tus migraciones
        return response()->json(['message' => 'Cuenta eliminada'], 200);
    }
}