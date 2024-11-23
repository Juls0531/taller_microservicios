<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EstudianteController extends Controller
{
    public function index(Request $request)
    {
        $estudiantes = DB::table('estudiantes')
            ->leftJoin('notas', 'estudiantes.cod', '=', 'notas.codEstudiante')
            ->select(
                'estudiantes.cod',
                'estudiantes.nombres',
                'estudiantes.email',
                DB::raw('IFNULL(AVG(notas.nota), "No hay nota") as nota_definitiva'),
                DB::raw('IFNULL(CASE WHEN AVG(notas.nota) >= 3.0 THEN "Aprobado" WHEN AVG(notas.nota) < 3.0 THEN "Reprobado" ELSE "No hay nota" END, "No hay nota") as estado')
            )
            ->groupBy('estudiantes.cod', 'estudiantes.nombres', 'estudiantes.email')
            ->get();

        $totalAprobados = $estudiantes->where('estado', 'Aprobado')->count();
        $totalReprobados = $estudiantes->where('estado', 'Reprobado')->count();
        $sinNotas = $estudiantes->where('nota_definitiva', 'No hay nota')->count();

        return response()->json([
            'estudiantes' => $estudiantes,
            'resumen' => [
                'aprobados' => $totalAprobados,
                'reprobados' => $totalReprobados,
                'sin_notas' => $sinNotas,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'cod' => 'required|unique:estudiantes,cod',
            'nombres' => 'required|string|max:250',
            'email' => 'required|email|unique:estudiantes,email|max:250',
        ]);

        DB::table('estudiantes')->insert([
            'cod' => $request->cod,
            'nombres' => $request->nombres,
            'email' => $request->email,
        ]);

        return response()->json(['message' => 'Estudiante registrado exitosamente.'], 201);
    }

    public function update(Request $request, $cod)
    {
        $request->validate([
            'cod' => 'required|unique:estudiantes,cod,' . $cod . ',cod',
            'nombres' => 'required|string|max:250',
            'email' => 'required|email|unique:estudiantes,email,' . $cod . ',cod',
        ]);

        DB::table('estudiantes')->where('cod', $cod)->update([
            'nombres' => $request->nombres,
            'email' => $request->email,
        ]);

        return response()->json(['message' => 'Estudiante actualizado exitosamente.']);
    }

    public function destroy($cod)
    {
        $tieneNotas = DB::table('notas')->where('codEstudiante', $cod)->exists();

        if ($tieneNotas) {
            return response()->json(['message' => 'No se puede eliminar el estudiante porque tiene notas registradas.'], 400);
        }

        DB::table('estudiantes')->where('cod', $cod)->delete();

        return response()->json(['message' => 'Estudiante eliminado exitosamente.']);
    }

    public function search(Request $request)
    {
        $query = DB::table('estudiantes')
            ->leftJoin('notas', 'estudiantes.cod', '=', 'notas.codEstudiante')
            ->select(
                'estudiantes.cod',
                'estudiantes.nombres',
                'estudiantes.email',
                DB::raw('IFNULL(AVG(notas.nota), "No hay nota") as nota_definitiva'),
                DB::raw('IFNULL(CASE WHEN AVG(notas.nota) >= 3.0 THEN "Aprobado" WHEN AVG(notas.nota) < 3.0 THEN "Reprobado" ELSE "No hay nota" END, "No hay nota") as estado')
            )
            ->groupBy('estudiantes.cod', 'estudiantes.nombres', 'estudiantes.email');

        if ($request->filled('cod')) {
            $query->where('estudiantes.cod', $request->cod);
        }
        if ($request->filled('nombres')) {
            $query->where('estudiantes.nombres', 'like', '%' . $request->nombres . '%');
        }
        if ($request->filled('email')) {
            $query->where('estudiantes.email', 'like', '%' . $request->email . '%');
        }
        if ($request->filled('estado')) {
            $query->having('estado', $request->estado);
        }
        if ($request->filled('rango_notas')) {
            $rango = explode('-', $request->rango_notas);
            $query->havingRaw('AVG(notas.nota) BETWEEN ? AND ?', [$rango[0], $rango[1]]);
        }
        if ($request->filled('sin_notas')) {
            $query->having('nota_definitiva', 'No hay nota');
        }

        $estudiantes = $query->get();

        return response()->json($estudiantes);
    }
}
