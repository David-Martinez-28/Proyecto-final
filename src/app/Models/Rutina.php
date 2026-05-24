<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rutina extends Model
{
    use HasFactory;
    
    protected $table = 'rutinas';
    protected $guarded = [];

    /**
     * Relación: Una rutina está compuesta por muchos ejercicios.
     * CAMBIO: 'rutina_ejercicio' -> 'ejercicio_rutina'
     */
    public function ejercicios()
    {
        return $this->belongsToMany(Ejercicio::class, 'ejercicio_rutina')
                    ->withPivot('series', 'repeticiones', 'duracion_segundos', 'notas')
                    ->withTimestamps();
    }

    /**
     * Relación: Una rutina es realizada por muchos pacientes.
     * CAMBIO: 'usuario_rutina' -> 'paciente_rutina'
     */
    public function usuarios()
    {
        return $this->belongsToMany(Paciente::class, 'paciente_rutina')
                    ->withPivot('fecha_inicio', 'fecha_fin')
                    ->withTimestamps();
    }
}