<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Paciente;
use App\Models\Dietista;
use Illuminate\Database\Seeder;

class PacienteSeeder extends Seeder
{
    public function run(): void
    {
        $dietistaPrincipal = Dietista::first();

        // 1. Vinculamos a Juan con Ana (el primer dietista)
        $juan = User::where('email', 'juan@test.com')->first();
        if ($juan && $dietistaPrincipal) {
            Paciente::create([
                'user_id' => $juan->id,
                'dietista_id' => $dietistaPrincipal->id,
                'nick' => 'JuanitoPro',
            ]);
        }

        // 2. Vinculamos al resto de pacientes a dietistas aleatorios
        $pacientesSinPerfil = User::where('role', 'paciente')
            ->whereDoesntHave('paciente')
            ->get();

        foreach ($pacientesSinPerfil as $user) {
            Paciente::factory()->create([
                'user_id' => $user->id,
                'dietista_id' => Dietista::inRandomOrder()->first()->id ?? Dietista::factory(),
            ]);
        }
    }
}