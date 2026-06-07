<?php

namespace Database\Seeders;

use App\Models\Comida;
use App\Models\Dietista;
use App\Models\Ingrediente;
use Illuminate\Database\Seeder;

class ComidaSeeder extends Seeder
{
    private static array $unidades = ['g', 'g', 'g', 'ml', 'ud']; // g con más peso para ser más común

    public function run(): void
    {
        // 1. Iteramos sobre todos los dietistas del sistema
        $dietistas = Dietista::all();

        foreach ($dietistas as $dietista) {
            
            // 2. Obtenemos SOLO los ingredientes de este dietista en concreto
            $ingredientes = Ingrediente::where('dietista_id', $dietista->id)->get();

            // Si por algún motivo este dietista no tiene ingredientes, pasamos al siguiente
            if ($ingredientes->isEmpty()) {
                continue;
            }

            // 3. Creamos las comidas forzando a que el creador sea este dietista
            Comida::factory()->count(10)->create([
                'dietista_id' => $dietista->id
            ])->each(function (Comida $comida) use ($ingredientes) {
                
               
                $cantidadASeleccionar = rand(1, min(5, $ingredientes->count()));
                $seleccion = $ingredientes->random($cantidadASeleccionar);

                $pivot = $seleccion->mapWithKeys(function (Ingrediente $ing) {
                    $unidad   = fake()->randomElement(self::$unidades);
                    $cantidad = match ($unidad) {
                        'ml' => fake()->randomFloat(2, 10, 50),
                        'ud' => fake()->numberBetween(1, 4),
                        default => fake()->randomFloat(2, 50, 250),
                    };

                    return [$ing->id => ['cantidad' => $cantidad, 'unidad' => $unidad]];
                });

                $comida->ingredientes()->attach($pivot->toArray());
            });
        }
    }
}