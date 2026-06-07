<?php

namespace Database\Factories;

use App\Models\Dietista;
use Illuminate\Database\Eloquent\Factories\Factory;

class IngredienteFactory extends Factory
{
    /**
     * Grupos de alimentos con rangos realistas de calorías y reparto de macros (por 100g)
     */
    private static array $grupos = [
        'verdura' => [
            'cal_min' => 15,  'cal_max' => 60,
            'p_min'   => 1.0, 'p_max'   => 3.0,
            'g_min'   => 0.1, 'g_max'   => 0.5,
            'c_min'   => 3.0, 'c_max'   => 10.0
        ],
        'fruta' => [
            'cal_min' => 40,  'cal_max' => 90,
            'p_min'   => 0.5, 'p_max'   => 1.5,
            'g_min'   => 0.1, 'g_max'   => 0.6,
            'c_min'   => 9.0, 'c_max'   => 22.0
        ],
        'cereal' => [
            'cal_min' => 320, 'cal_max' => 380,
            'p_min'   => 8.0, 'p_max'   => 13.0,
            'g_min'   => 1.0, 'g_max'   => 4.0,
            'c_min'   => 65.0, 'c_max'  => 78.0
        ],
        'legumbre' => [
            'cal_min' => 110, 'cal_max' => 160, 
            'p_min'   => 7.0, 'p_max'   => 10.0,
            'g_min'   => 0.5, 'g_max'   => 2.0,
            'c_min'   => 15.0, 'c_max'  => 25.0
        ],
        'carne' => [
            'cal_min' => 110, 'cal_max' => 250,
            'p_min'   => 18.0, 'p_max'  => 26.0,
            'g_min'   => 2.0, 'g_max'   => 18.0,
            'c_min'   => 0.0, 'c_max'   => 0.5
        ],
        'pescado' => [
            'cal_min' => 80,  'cal_max' => 200,
            'p_min'   => 17.0, 'p_max'  => 23.0,
            'g_min'   => 0.5, 'g_max'   => 12.0,
            'c_min'   => 0.0, 'c_max'   => 0.2
        ],
        'lácteo' => [
            'cal_min' => 40,  'cal_max' => 350,
            'p_min'   => 3.0, 'p_max'   => 25.0,
            'g_min'   => 0.1, 'g_max'   => 28.0,
            'c_min'   => 3.5, 'c_max'   => 5.0
        ],
        'grasa' => [
            'cal_min' => 700, 'cal_max' => 900,
            'p_min'   => 0.0, 'p_max'   => 1.0,
            'g_min'   => 80.0, 'g_max'  => 100.0,
            'c_min'   => 0.0, 'c_max'   => 0.5
        ],
        'fruto seco' => [
            'cal_min' => 550, 'cal_max' => 670,
            'p_min'   => 15.0, 'p_max'  => 25.0,
            'g_min'   => 45.0, 'g_max'  => 60.0,
            'c_min'   => 10.0, 'c_max'  => 20.0
        ],
    ];

    public function definition(): array
    {
        $grupo = fake()->randomElement(array_keys(self::$grupos));
        $rango = self::$grupos[$grupo];

        return [
            // Mantiene tu formato de nombre original
            'nombre'         => ucfirst(fake('es_ES')->word()) . ' (' . $grupo . ')',
            
            // Ajustado a las nuevas columnas de la migración corregida
            'calorias'       => fake()->randomFloat(2, $rango['cal_min'], $rango['cal_max']),
            'proteinas'      => fake()->randomFloat(2, $rango['p_min'], $rango['p_max']),
            'grasas'         => fake()->randomFloat(2, $rango['g_min'], $rango['g_max']),
            'carbohidratos'  => fake()->randomFloat(2, $rango['c_min'], $rango['c_max']),
            
            // 🔥 AÑADIDO: El dueño del ingrediente
            'dietista_id'    => Dietista::factory(),
        ];
    }
}