<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Paciente extends Model
{
    use HasFactory;

    protected $table = 'pacientes';
    protected $guarded = [];

    // Relación con la cuenta central
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // RELACIÓN N:1 -> Un paciente tiene un solo dietista
    public function dietista()
    {
        return $this->belongsTo(Dietista::class, 'dietista_id');
    }

    // Relación con Comidas (Muchos a Muchos)
    public function comidas()
    {
        return $this->belongsToMany(Comida::class, 'paciente_comida', 'paciente_id', 'comida_id')
            ->withPivot('dia_semana', 'momento', 'fecha_inicio', 'fecha_fin', 'estado')
            ->withTimestamps();
    }


    public function rutinas()
    {
        return $this->belongsToMany(Rutina::class, 'paciente_rutina', 'paciente_id', 'rutina_id')
            ->withPivot('fecha_inicio', 'fecha_fin')
            ->withTimestamps();
    }
}