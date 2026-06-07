<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Ingrediente extends Model
{
    use HasFactory;

    /**
     * La tabla asociada al modelo.
     * @var string
     */
    protected $table = 'ingredientes';

    /**
     * Los atributos que no son asignables masivamente.
     * @var array
     */
    protected $fillable = [
    'nombre', 
    'calorias', 
    'proteinas', 
    'grasas', 
    'carbohidratos', 
    'dietista_id' // ¡Imprescindible para el método create()!
];

    /**
     * Relación: Un ingrediente puede estar presente en muchas comidas.
     * 
     * Se define la tabla pivote 'comida_ingrediente' y se extraen 
     * los campos adicionales de cantidad y unidad.
     * 
     * @return BelongsToMany
     */
    public function comidas(): BelongsToMany
    {
        return $this->belongsToMany(Comida::class, 'comida_ingrediente')
                    ->withPivot('cantidad', 'unidad')
                    ->withTimestamps();
    }
    
    public function dietista()
    {
        return $this->belongsTo(Dietista::class);
    }
}