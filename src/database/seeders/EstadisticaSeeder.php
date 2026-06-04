<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Estadistica;
use App\Models\Paciente;

class EstadisticaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Creamos 5 registros de evolución para cada paciente existente
        Paciente::all()->each(function ($paciente) {
            Estadistica::factory()->count(5)->create([
                'paciente_id' => $paciente->id
            ]);
        });
    }
          

    

    
}
