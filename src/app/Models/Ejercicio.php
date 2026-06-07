<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ejercicio extends Model
{
    use HasFactory;

    protected $table = 'ejercicios';

    protected $fillable = [
    'nombre', 
    'grupo_muscular', 
    'descripcion', 
    'imagen', 
    'dietista_id' 
    ];

    /**
     * Relación: Un ejercicio puede formar parte de muchas rutinas.
     */
    public function rutinas()
    {
        return $this->belongsToMany(Rutina::class, 'rutina_ejercicio')
                    ->withPivot('series', 'repeticiones', 'duracion_segundos', 'notas');
    }
    // En app/Models/Rutina.php
    public function dietista()
    {
        return $this->belongsTo(Dietista::class);
    }
}