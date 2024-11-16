<?php

namespace App\Http\Controllers;

use App\Models\Nota;
use App\Models\Estudiante;
use Illuminate\Http\Request;

class NotaController extends Controller
{
    public function index(Request $request, $estudiante_id)
    {
        $estudiante = Estudiante::find($estudiante_id);

        if (!$estudiante) {
            return response()->json(['message' => 'Estudiante no encontrado'], 404);
        }

        $query = $estudiante->notas();

        if ($request->filled('actividad')) {
            $query->where('actividad', 'LIKE', '%' . $request->actividad . '%');
        }

        if ($request->filled('rango')) {
            $rango = explode('-', $request->rango);
            if (count($rango) === 2 && is_numeric($rango[0]) && is_numeric($rango[1])) {
                $query->whereBetween('nota', [(float)$rango[0], (float)$rango[1]]);
            }
        }

        $notas = $query->get();

        $resumen = [
            'por_debajo_de_3' => $notas->where('nota', '<', 3)->count(),
            'mayor_o_igual_a_3' => $notas->where('nota', '>=', 3)->count(),
        ];

        return response()->json(['notas' => $notas, 'resumen' => $resumen]);
    }

    public function store(Request $request, $estudiante_id)
    {
        $estudiante = Estudiante::find($estudiante_id);

        if (!$estudiante) {
            return response()->json(['message' => 'Estudiante no encontrado'], 404);
        }

        $request->validate([
            'actividad' => 'required|string|max:100',
            'nota' => 'required|numeric|between:0,5',
        ]);

        $nota = $estudiante->notas()->create($request->all());

        return response()->json(['message' => 'Nota registrada con éxito', 'nota' => $nota], 201);
    }

    public function update(Request $request, $id)
    {
        $nota = Nota::find($id);

        if (!$nota) {
            return response()->json(['message' => 'Nota no encontrada'], 404);
        }

        $request->validate([
            'actividad' => 'required|string|max:100',
            'nota' => 'required|numeric|between:0,5',
        ]);

        $nota->update($request->all());

        return response()->json(['message' => 'Nota actualizada con éxito', 'nota' => $nota]);
    }

    public function destroy($id)
    {
        $nota = Nota::find($id);

        if (!$nota) {
            return response()->json(['message' => 'Nota no encontrada'], 404);
        }

        $nota->delete();

        return response()->json(['message' => 'Nota eliminada exitosamente']);
    }

    public function statistics($estudiante_id)
    {
        $estudiante = Estudiante::find($estudiante_id);

        if (!$estudiante) {
            return response()->json(['message' => 'Estudiante no encontrado'], 404);
        }

        $notas = $estudiante->notas;

        $resumen = [
            'por_debajo_de_3' => $notas->where('nota', '<', 3)->count(),
            'mayor_o_igual_a_3' => $notas->where('nota', '>=', 3)->count(),
        ];

        return response()->json(['resumen' => $resumen]);
    }
}
