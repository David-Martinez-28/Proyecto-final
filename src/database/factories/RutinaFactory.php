<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class RutinaFactory extends Factory
{
    private static array $objetivos = [
        'Fuerza', 'Hipertrofia', 'Resistencia', 'Movilidad', 'Rehabilitación', 'Tonificación',
    ];

    private static array $zonas = [
        'tren superior', 'tren inferior', 'full body', 'core', 'hombros y espalda',
        'pierna y glúteo', 'pecho y tríceps', 'espalda y bíceps',
    ];

    private static array $niveles = [
        'principiante', 'intermedio', 'avanzado',
    ];

    public function definition(): array
    {
        $objetivo = fake()->randomElement(self::$objetivos);
        $zona     = fake()->randomElement(self::$zonas);
        $nivel    = fake()->randomElement(self::$niveles);

        return [
            'nombre'      => "{$objetivo} {$zona}",
            'descripcion' => "Rutina de {$nivel} enfocada en {$objetivo} de {$zona}. " . fake('es_ES')->sentence(10),
        ];
    }
}
