<?php

namespace App\Helpers;

class ResponseHelper
{
    /**
     * Success response
     */
    public static function success($data = null, $message = 'Operation successful', $code = 200)
    {
        $response = [
            'success' => true,
            'message' => $message,
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $code);
    }

    /**
     * Error response
     */
    public static function error($message = 'Operation failed', $error = null, $code = 500)
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($error !== null) {
            $response['error'] = $error;
        }

        return response()->json($response, $code);
    }

    /**
     * Validation error response
     */
    public static function validationError($errors, $message = 'Validation error')
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ], 422);
    }

    /**
     * Not found response
     */
    public static function notFound($message = 'Resource not found')
    {
        return response()->json([
            'success' => false,
            'message' => $message
        ], 404);
    }

    /**
     * Created response
     */
    public static function created($data = null, $message = 'Resource created successfully')
    {
        return self::success($data, $message, 201);
    }
}