<?php

namespace Database\Seeders;

use App\Models\Ejercicio;
use App\Models\Rutina;
use Illuminate\Database\Seeder;

class RutinaSeeder extends Seeder
{
    // Ejercicios que se hacen típicamente por tiempo en lugar de por repeticiones
    private static array $porTiempo = ['Plancha', 'Mountain climber', 'Burpee'];

    public function run(): void
    {
        $ejercicios = Ejercicio::all();

        Rutina::factory()->count(6)->create()->each(function (Rutina $rutina) use ($ejercicios) {
            $seleccion = $ejercicios->random(rand(4, 7));

            $pivot = $seleccion->mapWithKeys(function (Ejercicio $ej) {
                $esPorTiempo = in_array($ej->nombre, self::$porTiempo)
                    || fake()->boolean(20); // 20% de probabilidad extra de ser por tiempo

                return [
                    $ej->id => [
                        'series'            => fake()->numberBetween(3, 5),
                        'repeticiones'      => $esPorTiempo ? null : fake()->numberBetween(6, 15),
                        'duracion_segundos' => $esPorTiempo ? fake()->randomElement([20, 30, 45, 60]) : null,
                        'notas'             => fake()->boolean(25) ? fake('es_ES')->sentence() : null,
                    ],
                ];
            });

            $rutina->ejercicios()->attach($pivot->toArray());
        });
    }
}
