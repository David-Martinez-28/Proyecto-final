<?php

namespace Database\Seeders;

use App\Models\Comida;
use App\Models\Ingrediente;
use Illuminate\Database\Seeder;

class ComidaSeeder extends Seeder
{
    private static array $unidades = ['g', 'g', 'g', 'ml', 'ud']; // g con más peso para ser más común

    public function run(): void
    {
        $ingredientes = Ingrediente::all();

        Comida::factory()->count(10)->create()->each(function (Comida $comida) use ($ingredientes) {
            $seleccion = $ingredientes->random(rand(2, 5));

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
