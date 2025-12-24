<?php

namespace App\Helpers\Common;

use Carbon\Carbon;

class DateHelper
{
    /**
     * Format date to a readable format
     */
    public static function formatDate($date, $format = 'Y-m-d H:i')
    {
        if (!$date) {
            return null;
        }

        if (is_string($date)) {
            $date = Carbon::parse($date);
        }

        return $date->format($format);
    }

    /**
     * Format date to a human-readable format (e.g., "2 hours ago")
     */
    public static function formatToHuman($date)
    {
        if (!$date) {
            return null;
        }

        if (is_string($date)) {
            $date = Carbon::parse($date);
        }

        return $date->diffForHumans();
    }

    /**
     * Check if a date is in the past
     */
    public static function isPast($date)
    {
        if (!$date) {
            return false;
        }

        if (is_string($date)) {
            $date = Carbon::parse($date);
        }

        return $date->isPast();
    }

    /**
     * Check if a date is in the future
     */
    public static function isFuture($date)
    {
        if (!$date) {
            return false;
        }

        if (is_string($date)) {
            $date = Carbon::parse($date);
        }

        return $date->isFuture();
    }

    /**
     * Calculate the difference in days between two dates
     */
    public static function daysDifference($startDate, $endDate)
    {
        if (!$startDate || !$endDate) {
            return 0;
        }

        if (is_string($startDate)) {
            $startDate = Carbon::parse($startDate);
        }

        if (is_string($endDate)) {
            $endDate = Carbon::parse($endDate);
        }

        return $startDate->diffInDays($endDate);
    }

    /**
     * Get the start of the month for a given date
     */
    public static function startOfMonth($date = null)
    {
        $date = $date ? Carbon::parse($date) : Carbon::now();
        return $date->startOfMonth();
    }

    /**
     * Get the end of the month for a given date
     */
    public static function endOfMonth($date = null)
    {
        $date = $date ? Carbon::parse($date) : Carbon::now();
        return $date->endOfMonth();
    }

    /**
     * Get the start of the week for a given date
     */
    public static function startOfWeek($date = null)
    {
        $date = $date ? Carbon::parse($date) : Carbon::now();
        return $date->startOfWeek();
    }

    /**
     * Get the end of the week for a given date
     */
    public static function endOfWeek($date = null)
    {
        $date = $date ? Carbon::parse($date) : Carbon::now();
        return $date->endOfWeek();
    }
}