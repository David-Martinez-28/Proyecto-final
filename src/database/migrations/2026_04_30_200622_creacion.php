<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // 1. Tabla Central de Autenticación
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('role', ['dietista', 'paciente'])->default('paciente');
            $table->string('imagen')->default('default.png');
            $table->rememberToken();
            $table->timestamps();
        });

        // 2. Perfil de Dietistas
        Schema::create('dietistas', function (Blueprint $table) {
            $table->id();
            // Relación 1:1 con la cuenta de usuario
            $table->foreignId('user_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('num_colegiado')->unique()->nullable();
            $table->string('especialidad')->nullable();
            $table->timestamps();
        });

        // 3. Perfil de Pacientes
        Schema::create('pacientes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('usuarios')->cascadeOnDelete();
            
            // LA RELACIÓN 1:N -> Muchos pacientes tienen un mismo dietista
            $table->foreignId('dietista_id')->nullable()->constrained('dietistas')->nullOnDelete();
            
            $table->string('nick')->unique();
            $table->timestamps();
        });

        // 4. Catálogos (Comidas, Rutinas, Ejercicios, Ingredientes)
        Schema::create('comidas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->text('receta')->nullable();
            $table->integer('calorias')->nullable();
            $table->string('imagen')->nullable();
            
            
            $table->foreignId('dietista_id')->constrained('dietistas')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('rutinas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            
            
            
            
            $table->foreignId('dietista_id')->constrained('dietistas')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('ejercicios', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('grupo_muscular');
            $table->text('descripcion')->nullable();
            
            
            $table->string('imagen')->nullable(); 

           
            $table->foreignId('dietista_id')->constrained('dietistas')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('ingredientes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->decimal('calorias', 8, 2)->default(0); 
            $table->decimal('proteinas', 8, 2)->nullable()->default(0);
            $table->decimal('grasas', 8, 2)->nullable()->default(0);
            $table->decimal('carbohidratos', 8, 2)->nullable()->default(0);
            
           
            $table->foreignId('dietista_id')->constrained('dietistas')->cascadeOnDelete();
            $table->timestamps();
        });

        // 5. Tablas Pivote (Relaciones Muchos a Muchos)
        Schema::create('comida_ingrediente', function (Blueprint $table) {
            $table->foreignId('comida_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ingrediente_id')->constrained()->cascadeOnDelete();
            $table->decimal('cantidad', 8, 2);
            $table->string('unidad', 20)->default('g');
            $table->primary(['comida_id', 'ingrediente_id']);
            $table->timestamps();
        });

        Schema::create('ejercicio_rutina', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rutina_id')->constrained()->onDelete('cascade');
            $table->foreignId('ejercicio_id')->constrained()->onDelete('cascade');
            $table->integer('series')->nullable();
            $table->integer('repeticiones')->nullable();
            $table->integer('duracion_segundos')->nullable();
            $table->text('notas')->nullable();
            $table->timestamps();
        });

        // 6. Asignaciones (Lo que el dietista asigna al paciente)
        Schema::create('paciente_comida', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paciente_id')->constrained('pacientes')->cascadeOnDelete();
            $table->foreignId('comida_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('dia_semana'); 
            $table->enum('momento', ['desayuno', 'almuerzo', 'comida', 'merienda', 'cena']);
            $table->timestamps();
        });

        Schema::create('paciente_rutina', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paciente_id')->constrained('pacientes')->cascadeOnDelete();
            $table->foreignId('rutina_id')->constrained()->cascadeOnDelete();
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        
        Schema::dropIfExists('paciente_comida');
        Schema::dropIfExists('paciente_rutina');
        Schema::dropIfExists('comida_ingrediente');
        Schema::dropIfExists('ejercicio_rutina');

        // Luego los catálogos
        Schema::dropIfExists('comidas');
        Schema::dropIfExists('rutinas');
        Schema::dropIfExists('ejercicios');
        Schema::dropIfExists('ingredientes');

        // Finalmente los perfiles y usuarios base
        Schema::dropIfExists('pacientes');
        Schema::dropIfExists('dietistas');
        Schema::dropIfExists('usuarios');
    }
};