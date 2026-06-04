<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePacienteRequest extends FormRequest
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
            'nombre' => 'required|string|max:255',
            'email' => 'required|email|unique:pacientes,email',
            'fecha_nacimiento' => 'required|date',
            'objetivo' => 'nullable|string|in:ganancia,perdida,mantenimiento',
        ];
    }

    // Puedes personalizar los mensajes aquí
    public function messages(): array
    {
        return [
            'email.unique' => 'Este correo ya está registrado en el sistema.',
        ];
    }
}
