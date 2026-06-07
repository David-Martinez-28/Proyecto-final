<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            // --- 1. AUTENTICACIÓN Y PERFILES ---
            UserSeeder::class,        // 1. Crea las cuentas de login (users)
            DietistaSeeder::class,    // 2. Crea los perfiles de los profesionales
            PacienteSeeder::class,    // 3. Crea los perfiles de los clientes vinculados a dietistas

            // --- 2. CATÁLOGOS BASE (Piezas sueltas) ---
            IngredienteSeeder::class, // 4. Crea la despensa de cada dietista
            EjercicioSeeder::class,   // 5. Crea los ejercicios con sus fotos

            // --- 3. CONTENEDORES (Agrupaciones) ---
            ComidaSeeder::class,      // 6. Crea los platos mezclando los ingredientes
            RutinaSeeder::class,      // 7. Crea los entrenamientos agrupando ejercicios

            // --- 4. INTERACCIÓN Y SEGUIMIENTO ---
            AsignacionSeeder::class,  // 8. Asigna comidas y rutinas a los pacientes
            CitaSeeder::class,        // 9. Crea las citas entre dietistas y pacientes
            EstadisticaSeeder::class, // 10. Crea los registros de evolución de cada paciente
        ]);
    }
}