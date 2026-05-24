<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up()
    {
        Schema::table('paciente_comida', function (Blueprint $table) {
            $table->date('fecha_inicio')->nullable();
            $table->date('fecha_fin')->nullable();
            $table->string('estado')->default('activa'); // 'activa' o 'archivada'
        });
    }

    public function down()
    {
        Schema::table('paciente_comida', function (Blueprint $table) {
            $table->dropColumn(['fecha_inicio', 'fecha_fin', 'estado']);
        });
    }
};
