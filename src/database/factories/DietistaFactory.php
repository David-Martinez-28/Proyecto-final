<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class DietistaFactory extends Factory
{
    public function definition(): array
    {
        $prefijos = ['AND', 'CAT', 'MAD', 'VAL', 'GAL', 'ARA', 'CYL', 'EXT', 'MUR', 'NAV'];

        return [
            // Crea el usuario vinculado con rol dietista
            'user_id' => User::factory()->dietista(),
            'num_colegiado' => fake()->randomElement($prefijos) . '-' . fake()->unique()->numerify('####'),
        ];
    }
}