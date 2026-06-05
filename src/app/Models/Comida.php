<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comida extends Model
{
    use HasFactory;

        protected $table = 'comidas';
   protected $fillable = [
        'nombre',
        'descripcion',
        'receta',
        'calorias',
        'imagen',
    ];

    /**
     * Relación: Una comida tiene muchos ingredientes.
     */
    // En Comida.php
    public function ingredientes()
    {
        return $this->belongsToMany(Ingrediente::class, 'comida_ingrediente')
                    ->withPivot('cantidad', 'unidad') // <--- Esto es vital
                    ->withTimestamps();
    }

    /**
     * Relación: Una comida pertenece a los planes de muchos pacientes.
     */
    public function usuarios()
    {
        // CORREGIDO: Cambiada la tabla pivote a 'paciente_comida' y añadido 'estado'
        return $this->belongsToMany(Paciente::class, 'paciente_comida')
                    ->withPivot('dia_semana', 'momento', 'estado')
                    ->withTimestamps();
    }
}
