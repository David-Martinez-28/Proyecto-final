<?php

namespace Database\Seeders;

use App\Models\Ingrediente;
use Illuminate\Database\Seeder;

class IngredienteSeeder extends Seeder
{
    public function run(): void
    {
        // Creamos 50 ingredientes usando el factory que definimos antes
        Ingrediente::factory(50)->create();
    }
}