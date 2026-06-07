<?php

namespace Database\Seeders;

use App\Models\Dietista;
use App\Models\Ejercicio;
use App\Models\Rutina;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RutinaSeeder extends Seeder
{
    // Ejercicios que se hacen típicamente por tiempo en lugar de por repeticiones
    private static array $porTiempo = ['Plancha', 'Mountain climber', 'Burpee'];

    public function run(): void
    {
        // 1. Iteramos sobre los dietistas reales del sistema
        $dietistas = Dietista::all();

        foreach ($dietistas as $dietista) {
            
            // 2. Filtramos el catálogo de ejercicios para que solo use los suyos
            $ejercicios = Ejercicio::where('dietista_id', $dietista->id)->get();

            // Si este dietista no tiene ejercicios, no le creamos rutinas vacías
            if ($ejercicios->isEmpty()) {
                continue;
            }

            // 3. Creamos 6 rutinas forzando que su dueño sea este dietista
            Rutina::factory()->count(6)->create([
                'dietista_id' => $dietista->id
            ])->each(function (Rutina $rutina) use ($ejercicios) {
                
               
                $maxEjercicios = min(7, $ejercicios->count());
                $minEjercicios = min(4, $maxEjercicios); // Asegura que el mínimo no supere al máximo
                
                $seleccion = $ejercicios->random(rand($minEjercicios, $maxEjercicios));

                $pivot = $seleccion->mapWithKeys(function (Ejercicio $ej) {
                    
                    
                    $esPorTiempo = Str::contains($ej->nombre, self::$porTiempo, true)
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

                // Insertamos los datos en la tabla pivote 'ejercicio_rutina'
                $rutina->ejercicios()->attach($pivot->toArray());
            });
        }
    }
}