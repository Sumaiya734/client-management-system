<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BaseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return parent::toArray($request);
    }
    
    /**
     * Add common fields to all resources
     */
    protected function addCommonFields($data)
    {
        $commonFields = [
            'id' => $this->id,
            'created_at' => $this->created_at ? $this->created_at->format('Y-m-d H:i:s') : null,
            'updated_at' => $this->updated_at ? $this->updated_at->format('Y-m-d H:i:s') : null,
        ];
        
        return array_merge($commonFields, $data);
    }
    
    /**
     * Format a timestamp field
     */
    protected function formatTimestamp($timestamp, $format = 'Y-m-d H:i:s')
    {
        if (!$timestamp) {
            return null;
        }
        
        if (is_string($timestamp)) {
            return \Carbon\Carbon::parse($timestamp)->format($format);
        }
        
        return $timestamp->format($format);
    }
}