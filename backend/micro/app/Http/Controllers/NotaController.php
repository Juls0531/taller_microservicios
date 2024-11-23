<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotaController extends Controller
{
    public function index($cod)
    {
        try {
            $notas = Nota::where('codEstudiante', $cod)->get();

            $resumen = [
                'notas_bajas' => $notas->where('nota', '<', 3)->count(),
                'notas_altas' => $notas->where('nota', '>=', 3)->count(),
            ];

            return response()->json([
                'notas' => $notas,
                'resumen' => $resumen,
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'actividad' => 'required|string|max:100',
            'nota' => 'required|numeric|min:0|max:5',
            'codEstudiante' => 'required|exists:estudiantes,cod',
        ]);

        DB::table('notas')->insert([
            'actividad' => $request->actividad,
            'nota' => $request->nota,
            'codEstudiante' => $request->codEstudiante,
        ]);

        return response()->json(['message' => 'Nota registrada exitosamente.'], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'actividad' => 'required|string|max:100',
            'nota' => 'required|numeric|min:0|max:5',
        ]);

        $nota = DB::table('notas')->where('id', $id)->first();

        if (!$nota) {
            return response()->json(['message' => 'Nota no encontrada.'], 404);
        }

        DB::table('notas')->where('id', $id)->update([
            'actividad' => $request->actividad,
            'nota' => $request->nota,
        ]);

        return response()->json(['message' => 'Nota actualizada exitosamente.']);
    }

    public function destroy($id)
    {
        $nota = DB::table('notas')->where('id', $id)->first();

        if (!$nota) {
            return response()->json(['message' => 'Nota no encontrada.'], 404);
        }

        DB::table('notas')->where('id', $id)->delete();

        return response()->json(['message' => 'Nota eliminada exitosamente.']);
    }

    public function promedio($codEstudiante)
    {
        $promedio = DB::table('notas')
            ->where('codEstudiante', $codEstudiante)
            ->avg('nota');

        if ($promedio === null) {
            return response()->json(['message' => 'El estudiante no tiene notas registradas.'], 404);
        }

        return response()->json([
            'codEstudiante' => $codEstudiante,
            'promedio' => round($promedio, 2),
        ]);
    }
}
