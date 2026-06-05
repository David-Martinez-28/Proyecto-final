<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
  
    public function up(): void
{
    Schema::create('notificaciones', function (Blueprint $table) {
        $table->id();
        
        // CORREGIDO: Apuntar explícitamente a la tabla 'usuarios'
        $table->foreignId('user_id')->constrained('usuarios')->onDelete('cascade');
        $table->foreignId('remitente_id')->constrained('usuarios')->onDelete('cascade');
        
        $table->string('tipo_accion'); 
        $table->text('mensaje');
        $table->boolean('leido')->default(false);
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notificaciones');
    }
};
