<?php

namespace Database\Seeders;

use App\Models\Paciente;
use App\Models\Comida;
use App\Models\Rutina;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AsignacionSeeder extends Seeder
{
    private const MOMENTOS = ['desayuno', 'almuerzo', 'comida', 'merienda', 'cena'];

    public function run(): void
    {
        $comidas = Comida::all();
        $rutinas = Rutina::all();
        $pacientes = Paciente::all();

        if ($pacientes->isEmpty() || $comidas->isEmpty() || $rutinas->isEmpty()) {
            $this->command->error('Faltan datos base.');
            return;
        }

        $pacientes->each(function (Paciente $paciente) use ($comidas, $rutinas) {
            $this->asignarPlanNutricional($paciente, $comidas);
            $this->asignarPlanEntrenamiento($paciente, $rutinas);
        });

        $this->command->info('AsignacionSeeder: Planes vinculados correctamente.');
    }

    private function asignarPlanNutricional(Paciente $paciente, $comidas): void
    {
        $batchComidas = [];

        for ($dia = 0; $dia <= 6; $dia++) {
            $momentosDia = collect(self::MOMENTOS)->random(rand(3, 5));

            foreach ($momentosDia as $momento) {
                $batchComidas[] = [
                    'paciente_id' => $paciente->id, // CORREGIDO: de usuario_id a paciente_id
                    'comida_id'   => $comidas->random()->id,
                    'dia_semana'  => $dia,
                    'momento'     => $momento,
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ];
            }
        }

        // CORREGIDO: de usuario_comida a paciente_comida
        DB::table('paciente_comida')->insert($batchComidas);
    }

    private function asignarPlanEntrenamiento(Paciente $paciente, $rutinas): void
    {
        $rutinasSeleccionadas = $rutinas->random(rand(1, 2));

        foreach ($rutinasSeleccionadas as $rutina) {
            $fechaInicio = Carbon::now()->subDays(rand(0, 15));
            
            // Esto funcionará si tu modelo Paciente tiene la relación 'rutinas' 
            // apuntando a la tabla 'paciente_rutina'
            $paciente->rutinas()->attach($rutina->id, [
                'fecha_inicio' => $fechaInicio->toDateString(),
                'fecha_fin'    => $fechaInicio->copy()->addDays(rand(30, 90))->toDateString(),
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);
        }
    }
}