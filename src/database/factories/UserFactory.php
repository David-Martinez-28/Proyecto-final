<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->name(); // Guardamos el nombre en una variable para usarlo en la foto

        return [
            'name' => $name,
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'paciente',
            'remember_token' => Str::random(10),
            // Genera una imagen con fondo aleatorio y la inicial del nombre
            'avatar' => 'https://ui-avatars.com/api/?background=random&color=fff&name=' . urlencode($name),
        ];
    }

    // Estado para crear un administrador/dietista rápidamente
    public function dietista(): static
    {
        return $this->state(fn(array $attributes) => [
            'role' => 'dietista',
        ]);
    }
}
