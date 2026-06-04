<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,        // 1. Crea las cuentas de login
            DietistaSeeder::class,    // 2. Crea los perfiles de los profesionales
            PacienteSeeder::class,    // 3. Crea los perfiles de los clientes vinculados a dietistas
            IngredienteSeeder::class, // 4. Crea la despensa
            ComidaSeeder::class,      // 5. Crea los platos usando ingredientes
            EjercicioSeeder::class,    // 6. Crea los ejercicios
            RutinaSeeder::class,      // 6. Crea los entrenamientos
            AsignacionSeeder::class,
            CitaSeeder::class,        // 7. Crea las citas entre dietistas y pacientes
            EstadisticaSeeder::class, // 7. Crea los registros de estadísticas para cada paciente
        ]);
    }
}