<?php

namespace App\Models\Traits;

use App\Models\Scopes\RegionScope;

trait HasRegionScope
{
    /**
     * Boot the trait and add the global scope.
     */
    protected static function bootHasRegionScope()
    {
        static::addGlobalScope(new RegionScope);

        static::creating(function ($model) {
            if (\Illuminate\Support\Facades\Auth::check() && empty($model->region_id)) {
                $user = \Illuminate\Support\Facades\Auth::user();
                
                if ($user->isSuperAdmin()) {
                    if (session()->has('current_region_id') && session('current_region_id') !== 'all') {
                        $model->region_id = session('current_region_id');
                    }
                } elseif ($user->region_id) {
                    $model->region_id = $user->region_id;
                }
            }
        });
    }
}
