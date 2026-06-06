<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

// 🔥 CORREGIDO: Importamos los modelos para que Eloquent pueda resolver las tablas pivote
use App\Models\Ingrediente;
use App\Models\Paciente;

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
    public function ingredientes(): BelongsToMany
    {
        return $this->belongsToMany(Ingrediente::class, 'comida_ingrediente')
                    ->withPivot('cantidad', 'unidad')
                    ->withTimestamps();
    }

    /**
     * Relación: Una comida pertenece a los planes de muchos pacientes.
     */
    public function usuarios(): BelongsToMany
    {
        return $this->belongsToMany(Paciente::class, 'paciente_comida')
                    ->withPivot('dia_semana', 'momento', 'estado')
                    ->withTimestamps();
    }
}
