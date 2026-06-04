<?php

namespace Database\Factories;

use App\Models\Cita;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Cita>
 */
class CitaFactory extends Factory
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
        'dietista_id' => \App\Models\Dietista::inRandomOrder()->first()->id,
        'fecha_hora' => fake()->dateTimeBetween('now', '+1 month'),
        'motivo' => fake()->sentence(),
        'estado' => fake()->randomElement(['pendiente', 'confirmada', 'cancelada']),
    ];
}
}
