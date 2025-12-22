@extends('layouts.app')

@section('content')
<div class="container">
    <h2>Admin Dashboard</h2>
    <p>Welcome, {{ Auth::user()->name }}! You have full access.</p>
</div>
@endsection