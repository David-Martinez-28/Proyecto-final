<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('estadisticas', function (Blueprint $table) {
            $table->id();
            // Clave foránea que enlaza con tu tabla de pacientes
            $table->foreignId('paciente_id')->constrained()->onDelete('cascade');
            
            $table->decimal('peso', 5, 2);
            $table->decimal('altura', 5, 2);
            $table->decimal('porcentaje_graso', 5, 2)->nullable();
            $table->decimal('masa_muscular', 5, 2)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('estadisticas');
    }
};