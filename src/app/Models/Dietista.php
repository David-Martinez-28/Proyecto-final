<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Dietista extends Model
{
    use HasFactory;

    protected $table = 'dietistas';

    protected $fillable = ['user_id', 'num_colegiado'];

    // Acceder a la cuenta de User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * RELACIÓN 1:N -> El dietista tiene muchos pacientes.
     */
    public function pacientes()
    {
        return $this->hasMany(Paciente::class, 'dietista_id');
    }
}