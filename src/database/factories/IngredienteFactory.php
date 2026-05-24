<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class IngredienteFactory extends Factory
{
    // Grupos de alimentos con rangos de kcal realistas por 100g
    private static array $grupos = [
        'verdura'  => ['min' => 15,  'max' => 60],
        'fruta'    => ['min' => 40,  'max' => 100],
        'cereal'   => ['min' => 300, 'max' => 400],
        'legumbre' => ['min' => 100, 'max' => 180],
        'carne'    => ['min' => 120, 'max' => 280],
        'pescado'  => ['min' => 80,  'max' => 220],
        'lácteo'   => ['min' => 40,  'max' => 400],
        'grasa'    => ['min' => 600, 'max' => 900],
        'fruto seco' => ['min' => 500, 'max' => 650],
    ];

    public function definition(): array
    {
        $grupo  = fake()->randomElement(array_keys(self::$grupos));
        $rango  = self::$grupos[$grupo];

        return [
            'nombre'        => ucfirst(fake('es_ES')->word()) . ' (' . $grupo . ')',
            'kcal_por_100g' => fake()->randomFloat(2, $rango['min'], $rango['max']),
        ];
    }
}
