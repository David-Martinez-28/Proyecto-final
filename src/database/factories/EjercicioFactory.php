<?php

namespace Database\Factories;

use App\Models\Ejercicio;
use Illuminate\Database\Eloquent\Factories\Factory;

class EjercicioFactory extends Factory
{
    /**
     * El modelo correspondiente al factory.
     */
    protected $model = Ejercicio::class;

    private static array $musculos = [
        'Pectoral', 'Dorsal', 'Hombro', 'Bíceps', 'Tríceps',
        'Cuádriceps', 'Isquiotibiales', 'Glúteo', 'Gemelo', 'Core',
        'Lumbar', 'Trapecio', 'Full body',
    ];

    private static array $prefijos = [
        'Press', 'Curl', 'Extensión', 'Elevación', 'Remo',
        'Sentadilla', 'Peso muerto', 'Zancada', 'Plancha', 'Jalón',
    ];

    private static array $sufijos = [
        'con mancuernas', 'con barra', 'en polea', 'en máquina',
        'con cable', 'con kettlebell', 'en TRX', 'con banda elástica', '',
    ];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $prefijo = fake()->randomElement(self::$prefijos);
        $sufijo  = fake()->randomElement(self::$sufijos);

        return [
            'nombre'         => trim("{$prefijo} {$sufijo}"),
            
            'grupo_muscular' => fake()->randomElement(self::$musculos),
            'descripcion'    => fake()->sentence(8), 
        ];
    }
}