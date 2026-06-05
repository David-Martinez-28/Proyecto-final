<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cita extends Model
{
    use HasFactory;

    protected $fillable = ['paciente_id', 'dietista_id', 'fecha_hora', 'estado', 'motivo', 'motivo_cancelacion'];

    // Relación con el Paciente
    public function paciente() {
        return $this->belongsTo(Paciente::class);
    }

    // Relación con el Dietista
    public function dietista() {
        return $this->belongsTo(Dietista::class);
    }
}