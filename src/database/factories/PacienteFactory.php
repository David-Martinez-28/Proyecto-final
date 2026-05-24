<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Dietista;
use Illuminate\Database\Eloquent\Factories\Factory;

class PacienteFactory extends Factory
{
    public function definition(): array
    {
        return [
            // Crea un usuario normal
            'user_id' => User::factory(), 
            'nick' => fake()->unique()->userName(),
            // Busca un dietista existente o crea uno nuevo si no hay
            'dietista_id' => Dietista::inRandomOrder()->first() ?? Dietista::factory(),
        ];
    }
}