<?php

namespace Database\Seeders;

use App\Models\Dietista;
use App\Models\Ingrediente;
use Illuminate\Database\Seeder;

class IngredienteSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buscamos a todos los dietistas que ya existen
        $dietistas = Dietista::all();

        // 2. Creamos 50 ingredientes exclusivos para cada uno de ellos
        foreach ($dietistas as $dietista) {
            Ingrediente::factory(50)->create([
                'dietista_id' => $dietista->id
            ]);
        }
    }
}