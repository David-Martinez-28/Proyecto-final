<?php

namespace Database\Seeders;

use App\Models\Ejercicio;
use Illuminate\Database\Seeder;

class EjercicioSeeder extends Seeder
{
    public function run(): void
    {
        Ejercicio::factory()->count(15)->create();
    }
}
