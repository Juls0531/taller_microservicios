<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Estudiante extends Model
{
    use HasFactory;

    protected $table = 'estudiantes'; 
    public $timestamps = false; 
    protected $fillable = [ 
        'nombre',
        'email',
        'telefono'
    ];

    public function notas()
    {
        return $this->hasMany(Nota::class, 'id_estudiante');
    }
}
