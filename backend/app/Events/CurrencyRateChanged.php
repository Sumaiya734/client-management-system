<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CurrencyRateChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $currency;
    public $rate;
    public $action;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct($currency, $rate, $action = 'updated')
    {
        $this->currency = $currency;
        $this->rate = $rate;
        $this->action = $action;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        // Public channel for currency rate updates - configure broadcasting driver to use this
        return new Channel('currency-rates');
    }

    /**
     * Data to broadcast with the event.
     *
     * @return array
     */
    public function broadcastWith()
    {
        return [
            'currency' => $this->currency,
            'rate' => $this->rate,
            'action' => $this->action,
        ];
    }

    /**
     * Custom event name for JavaScript listeners
     */
    public function broadcastAs()
    {
        return 'CurrencyRateChanged';
    }
}
