<?php

namespace Database\Factories;

use App\Models\Estadistica;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Estadistica>
 */
class EstadisticaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'paciente_id' => \App\Models\Paciente::inRandomOrder()->first()->id,
            'peso' => fake()->randomFloat(2, 60, 100),
            'altura' => 175.50,
            'porcentaje_graso' => fake()->randomFloat(2, 10, 30),
            'masa_muscular' => fake()->randomFloat(2, 30, 50),
            'created_at' => fake()->dateTimeBetween('-3 months', 'now'),
        ];
    }
}
