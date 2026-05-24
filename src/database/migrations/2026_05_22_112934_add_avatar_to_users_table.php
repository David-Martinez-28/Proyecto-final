<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('usuarios', function (Blueprint $table) {
            // Añadimos la columna avatar, que puede estar vacía (nullable)
            $table->string('avatar')->nullable();
        });
    }

    public function down()
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropColumn('avatar');
        });
    }
};