<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RegisterUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
   public function rules(): array
{
    return [
        'name'     => 'required|string|max:255',
        'email'    => 'required|string|email|unique:usuarios,email',
        'password' => 'required|string|min:8',
        'role'     => 'required|in:dietista,paciente',
        'nick'     => 'required_if:role,paciente|unique:pacientes,nick',
        // Validaciones condicionales para dietista
        'especialidad' => 'required_if:role,dietista',
    ];
}

    // Puedes personalizar los mensajes aquí
    public function messages(): array
    {
        return [
            'email.unique' => 'Este correo ya está registrado en el sistema.',
            'nick.unique' => 'Este nick ya está registrado para otro paciente.',
            'especialidad.required_if' => 'La especialidad es obligatoria para dietistas.',
        ];
    }
}
