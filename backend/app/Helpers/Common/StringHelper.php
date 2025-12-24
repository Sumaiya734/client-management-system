<?php

namespace App\Helpers\Common;

class StringHelper
{
    /**
     * Generate a random string
     */
    public static function random($length = 16)
    {
        return substr(str_shuffle(str_repeat($x='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', ceil($length/strlen($x)))), 1, $length);
    }

    /**
     * Generate a UUID
     */
    public static function uuid()
    {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }

    /**
     * Sanitize a string by removing special characters
     */
    public static function sanitize($string, $allowed = [])
    {
        $string = strip_tags($string);
        
        if (empty($allowed)) {
            $string = preg_replace('/[^A-Za-z0-9\-_ ]/', '', $string);
        } else {
            $allowedChars = implode('', $allowed);
            $string = preg_replace('/[^A-Za-z0-9\-_ ' . preg_quote($allowedChars, '/') . ']/', '', $string);
        }
        
        return trim($string);
    }

    /**
     * Truncate a string to a given length
     */
    public static function truncate($string, $length = 100, $append = '...')
    {
        if (strlen($string) <= $length) {
            return $string;
        }

        $string = substr($string, 0, $length);
        $string = rtrim($string, '!,.-');
        $string = substr($string, 0, strrpos($string, ' '));

        return $string . $append;
    }

    /**
     * Convert a string to slug format
     */
    public static function slug($string, $separator = '-')
    {
        $string = trim($string);
        $string = strtolower($string);
        $string = preg_replace('/[^a-z0-9\s-]/', '', $string);
        $string = preg_replace('/[\s-]+/', $separator, $string);

        return $string;
    }

    /**
     * Convert snake_case to camelCase
     */
    public static function snakeToCamel($string)
    {
        $parts = explode('_', $string);
        $camelCase = $parts[0];
        
        for ($i = 1; $i < count($parts); $i++) {
            $camelCase .= ucfirst($parts[$i]);
        }
        
        return $camelCase;
    }

    /**
     * Convert camelCase to snake_case
     */
    public static function camelToSnake($string)
    {
        return strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $string));
    }

    /**
     * Convert string to title case with proper handling of acronyms
     */
    public static function titleCase($string)
    {
        $string = strtolower($string);
        $words = explode(' ', $string);
        $result = [];

        foreach ($words as $word) {
            // Handle acronyms (words with all caps)
            if (strlen($word) <= 3 && ctype_upper($word)) {
                $result[] = $word;
            } else {
                $result[] = ucfirst($word);
            }
        }

        return implode(' ', $result);
    }

    /**
     * Check if a string contains any of the specified substrings
     */
    public static function containsAny($string, $substrings)
    {
        foreach ($substrings as $substring) {
            if (strpos($string, $substring) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Replace multiple occurrences of strings
     */
    public static function replaceMultiple($string, $replacements)
    {
        return str_replace(array_keys($replacements), array_values($replacements), $string);
    }
}