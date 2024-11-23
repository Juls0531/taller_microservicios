<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EstudianteController;
use App\Http\Controllers\NotaController;
use Illuminate\Http\Request;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::prefix('app')->group(function () {

    Route::controller(EstudianteController::class)->group(function () {
        Route::get('estudiantes', 'index'); 
        Route::get('estudiante/{cod}', 'show'); 
        Route::post('estudiante', 'store'); 
        Route::put('estudiante/{cod}', 'update');
        Route::delete('estudiante/{cod}', 'destroy');

        Route::get('estudiantes-aprobados', 'aprobados');
        Route::get('estudiantes-reprobados', 'reprobados'); 
        Route::get('estudiantes-sin-notas', 'sinNotas');
    });

    Route::controller(NotaController::class)->group(function () {
        Route::get('notas', 'index'); 
        Route::get('nota/{id}', 'show'); 
        Route::post('nota', 'store'); 
        Route::put('nota/{id}', 'update');
        Route::delete('nota/{id}', 'destroy');
        Route::get('promedio/{codEstudiante}', 'promedio'); 
        Route::post('notas', 'store'); 
        Route::get('/estudiantes/{cod}/notas', [NotaController::class, 'index']);

    });
});
