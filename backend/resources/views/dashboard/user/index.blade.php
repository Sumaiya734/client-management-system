@extends('layouts.app')

@section('content')
<div class="container">
    <h2>Welcome, {{ Auth::user()->name }}!</h2>
    <p>You are logged in as a <strong>User</strong>.</p>
</div>
@endsection