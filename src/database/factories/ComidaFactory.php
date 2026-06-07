<?php

namespace Database\Factories;

use App\Models\Dietista;
use Illuminate\Database\Eloquent\Factories\Factory;

class ComidaFactory extends Factory
{
    // Técnicas de preparación y bases para generar nombres de comidas verosímiles
    private static array $tecnicas = [
        'a la plancha', 'al horno', 'al vapor', 'salteado', 'hervido',
        'estofado', 'asado', 'crudo', 'a la parrilla',
    ];

    private static array $bases = [
        'de pollo', 'de ternera', 'de salmón', 'de atún', 'de lentejas',
        'de garbanzos', 'de arroz', 'de pasta', 'de quinoa', 'vegetal',
        'de tofu', 'de huevo', 'de bacalao', 'de merluza',
    ];

    public function definition(): array
    {
        $tipo    = fake()->randomElement(['Ensalada', 'Bowl', 'Crema', 'Salteado', 'Guiso', 'Plato']);
        $base    = fake()->randomElement(self::$bases);
        $tecnica = fake()->randomElement(self::$tecnicas);

        return [
            'nombre'      => "{$tipo} {$base} {$tecnica}",
            'descripcion' => fake('es_ES')->sentence(rand(8, 14)),
            // Añadimos receta y calorías para rellenar la vista del paciente
            'receta'      => fake('es_ES')->paragraphs(2, true),
            'calorias'    => fake()->numberBetween(250, 850),
            // Añadimos la foto aleatoria que necesita el frontend
            'imagen'      => 'https://loremflickr.com/640/480/food,meal,dish?random=' . fake()->unique()->numberBetween(1, 1000),
            
            // 🔥 CAMBIO CRÍTICO: Añadimos el propietario
            'dietista_id' => Dietista::factory(),
        ];
    }
}