Route::get('/test', function () {
    return response()->json([
        'project' => 'Client Management System',
        'status' => 'API is working'
    ]);
});
