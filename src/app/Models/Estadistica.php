<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Estadistica extends Model
{
    use HasFactory;
    protected $fillable = [
        'paciente_id',
        'peso',
        'altura',
        'porcentaje_graso',
        'masa_muscular'
    ];

    public function paciente()
    {
        return $this->belongsTo(Paciente::class);
    }
}