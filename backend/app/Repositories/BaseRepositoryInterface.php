<?php

namespace App\Repositories;

use Illuminate\Http\Request;

interface BaseRepositoryInterface
{
    public function all();
    public function find($id);
    public function create(array $data);
    public function update($id, array $data);
    public function delete($id);
    public function search(Request $request);
    public function paginate(Request $request, $perPage = 10);
    public function with(array $relations);
    public function where(array $conditions);
}