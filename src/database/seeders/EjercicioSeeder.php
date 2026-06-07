<?php

namespace Database\Seeders;

use App\Models\Dietista;
use App\Models\Ejercicio;
use Illuminate\Database\Seeder;

class EjercicioSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buscamos a todos los dietistas que ya existen en el sistema
        $dietistas = Dietista::all();

        // 2. Le generamos a cada uno su propio catálogo aislado
        foreach ($dietistas as $dietista) {
            Ejercicio::factory()->count(15)->create([
                'dietista_id' => $dietista->id
            ]);
        }
    }
}