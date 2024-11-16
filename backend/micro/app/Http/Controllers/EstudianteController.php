<?php

namespace App\Http\Controllers;

use App\Models\Estudiante;
use Illuminate\Http\Request;

class EstudianteController extends Controller
{
    public function index()
    {
        $estudiantes = Estudiante::with('notas')->get();

        $resumen = [
            'aprobados' => $estudiantes->aprobados()->count(),
            'reprobados' => $estudiantes->reprobados()->count(),
            'sin_notas' => $estudiantes->filter(fn($estudiante) => is_null($estudiante->nota_definitiva))->count(),
        ];

        return response()->json(['estudiantes' => $estudiantes, 'resumen' => $resumen]);
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'nombres' => 'required|string|max:250',
                'email' => 'required|email|unique:estudiantes,email',
            ]);

            $estudiante = Estudiante::create($request->all());

            return response()->json($estudiante, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al registrar el estudiante.'], 500);
        }
    }

    public function update(Request $request, $cod)
    {
        $estudiante = Estudiante::find($cod);

        if (!$estudiante) {
            return response()->json(['message' => 'Estudiante no encontrado'], 404);
        }

        $request->validate([
            'nombres' => 'required|string|max:250',
            'email' => 'required|email|unique:estudiantes,email,' . $cod,
        ]);

        $estudiante->update($request->all());

        return response()->json($estudiante);
    }

    public function destroy($cod)
    {
        $estudiante = Estudiante::with('notas')->find($cod);

        if (!$estudiante) {
            return response()->json(['message' => 'Estudiante no encontrado'], 404);
        }

        if ($estudiante->notas->isNotEmpty()) {
            return response()->json(['message' => 'No se puede eliminar, el estudiante tiene notas registradas.'], 400);
        }

        $estudiante->delete();

        return response()->json(['message' => 'Estudiante eliminado exitosamente']);
    }

    public function statistics()
    {
        $estudiantes = Estudiante::with('notas')->get();

        $resumen = [
            'aprobados' => $estudiantes->aprobados()->count(),
            'reprobados' => $estudiantes->reprobados()->count(),
            'sin_notas' => $estudiantes->filter(fn($estudiante) => is_null($estudiante->nota_definitiva))->count(),
        ];

        return response()->json($resumen);
    }
}
