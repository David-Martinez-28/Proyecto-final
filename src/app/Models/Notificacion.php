<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notificacion extends Model
{
    // Le decimos explícitamente a Laravel que la tabla se llama así
    protected $table = 'notificaciones';

    protected $fillable = [
        'user_id',
        'remitente_id',
        'tipo_accion',
        'mensaje',
        'leido'
    ];
}