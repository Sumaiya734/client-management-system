<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Validator;

class ValidationHelper
{
    /**
     * Validate data with given rules
     */
    public static function validate(array $data, array $rules, array $messages = [], array $attributes = [])
    {
        $validator = Validator::make($data, $rules, $messages, $attributes);
        
        if ($validator->fails()) {
            return [
                'valid' => false,
                'errors' => $validator->errors()
            ];
        }
        
        return [
            'valid' => true,
            'validated_data' => $validator->validated()
        ];
    }

    /**
     * Validate unique rule excluding current record
     */
    public static function uniqueRule($table, $column, $except = null, $idColumn = 'id')
    {
        if ($except !== null) {
            return "unique:{$table},{$column},{$except},{$idColumn}";
        }
        
        return "unique:{$table},{$column}";
    }

    /**
     * Get common validation rules
     */
    public static function getCommonRules($resourceType)
    {
        $commonRules = [
            'client' => [
                'name' => 'required|string|max:255',
                'company' => 'nullable|string|max:255',
                'email' => 'required|email',
                'phone' => 'nullable|string|max:20',
                'status' => 'required|string|in:Active,Inactive',
                'address' => 'nullable|string'
            ],
            'product' => [
                'product_name' => 'required|string|max:255',
                'vendor_type' => 'nullable|string|max:255',
                'base_price' => 'required|numeric|min:0',
                'bdt_price' => 'nullable|numeric|min:0',
                'multi_currency' => 'nullable|string',
                'status' => 'required|string|in:Active,Inactive',
            ],
            'user' => [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255',
                'password' => 'nullable|string|min:8',
                'role' => 'required|string|in:admin,user,accountant,sales,support',
                'status' => 'string|in:Active,Inactive',
            ]
        ];

        return $commonRules[$resourceType] ?? [];
    }
}