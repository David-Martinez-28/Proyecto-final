<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // Importante para React

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'usuarios';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role', 
        'imagen'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Relación: Si el usuario es un Dietista.
     */
    public function dietista()
    {
        return $this->hasOne(Dietista::class, 'user_id');
    }

    /**
     * Relación: Si el usuario es un Paciente (Usuario).
     */
    public function paciente()
    {
        return $this->hasOne(Paciente::class, 'user_id');
    }
}