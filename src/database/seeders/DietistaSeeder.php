<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Dietista;
use Illuminate\Database\Seeder;

class DietistaSeeder extends Seeder
{
    public function run(): void
    {
        // Buscamos al usuario 'ana@test.com' para asignarle el perfil profesional
        $ana = User::where('email', 'ana@test.com')->first();
        
        if ($ana) {
            Dietista::create([
                'user_id' => $ana->id,
                'num_colegiado' => 'COL-0001-AND',
            ]);
        }

        // Creamos perfiles para el resto de usuarios que sean dietistas y no tengan perfil
        $dietistasSinPerfil = User::where('role', 'dietista')
            ->whereDoesntHave('dietista')
            ->get();

        foreach ($dietistasSinPerfil as $user) {
            Dietista::factory()->create(['user_id' => $user->id]);
        }
    }
}