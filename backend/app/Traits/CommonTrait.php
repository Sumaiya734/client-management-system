<?php

namespace App\Traits;

use Illuminate\Http\Request;

trait CommonTrait
{
    /**
     * Format validation errors for API responses
     */
    public function formatValidationErrors($validator)
    {
        return $validator->errors()->toArray();
    }

    /**
     * Check if request has search parameters
     */
    public function hasSearch(Request $request)
    {
        return $request->has('search') && !empty($request->get('search'));
    }

    /**
     * Get search term from request
     */
    public function getSearchTerm(Request $request)
    {
        return $request->get('search', '');
    }

    /**
     * Check if request has status filter
     */
    public function hasStatusFilter(Request $request, $defaultExcludedValue = 'All Status')
    {
        return $request->has('status') && $request->get('status') !== $defaultExcludedValue;
    }

    /**
     * Get status filter value
     */
    public function getStatusFilter(Request $request)
    {
        return $request->get('status');
    }

    /**
     * Get pagination per page value
     */
    public function getPerPage(Request $request, $default = 10)
    {
        return $request->get('per_page', $default);
    }

    /**
     * Build search query with multiple fields
     */
    public function buildSearchQuery($query, $fields, $searchTerm)
    {
        return $query->where(function ($q) use ($fields, $searchTerm) {
            foreach ($fields as $field) {
                $q->orWhere($field, 'like', "%{$searchTerm}%");
            }
        });
    }

    /**
     * Format timestamp to readable format
     */
    public function formatTimestamp($timestamp, $format = 'Y-m-d H:i')
    {
        if (!$timestamp) {
            return 'Never';
        }
        
        if (is_string($timestamp)) {
            $timestamp = \Carbon\Carbon::parse($timestamp);
        }
        
        return $timestamp->format($format);
    }

    /**
     * Sanitize input data
     */
    public function sanitizeInput($data, $allowedKeys = [])
    {
        if (empty($allowedKeys)) {
            return $data;
        }
        
        return array_intersect_key($data, array_flip($allowedKeys));
    }
}