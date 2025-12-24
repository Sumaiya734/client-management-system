<?php

namespace App\Http\Requests;

class ClientFormRequest extends BaseFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $method = $this->method();
        
        switch($method) {
            case 'POST': // Create
                return [
                    'name' => 'required|string|max:255',
                    'company' => 'nullable|string|max:255',
                    'email' => 'required|email|unique:clients,email',
                    'phone' => 'nullable|string|max:20',
                    'status' => 'required|string|in:Active,Inactive',
                    'address' => 'nullable|string'
                ];
            case 'PUT': // Update
            case 'PATCH':
                $id = $this->route('client'); // Get client ID from route parameter
                return [
                    'name' => 'sometimes|string|max:255',
                    'company' => 'nullable|string|max:255',
                    'email' => 'sometimes|email|unique:clients,email,' . $id,
                    'phone' => 'nullable|string|max:20',
                    'status' => 'sometimes|string|in:Active,Inactive',
                    'address' => 'nullable|string'
                ];
            default:
                return [];
        }
    }

    /**
     * Get custom messages for validation errors.
     */
    public function messages(): array
    {
        return [
            'email.unique' => 'A client with this email already exists.',
            'name.required' => 'Client name is required.',
        ];
    }
}