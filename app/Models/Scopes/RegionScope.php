<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class RegionScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        if (\Illuminate\Support\Facades\Auth::check()) {
            $user = \Illuminate\Support\Facades\Auth::user();

            if ($user->isSuperAdmin()) {
                if (session()->has('current_region_id') && session('current_region_id') !== 'all') {
                    $builder->where($model->getTable() . '.region_id', session('current_region_id'));
                }
            } else {
                if ($user->region_id) {
                    $builder->where($model->getTable() . '.region_id', $user->region_id);
                }
            }
        } else {
            // Ziyaretçiler için (Giriş yapmamış)
            // Varsayılan olarak 5. bölgeyi baz al (kullanıcı değiştirebilir)
            $publicRegionId = session('public_region_id', \Illuminate\Support\Facades\Auth::check() && \Illuminate\Support\Facades\Auth::user()->region_id ? \Illuminate\Support\Facades\Auth::user()->region_id : 5);
            if ($publicRegionId !== 'all') {
                $builder->where($model->getTable() . '.region_id', $publicRegionId);
            }
        }
    }
}
