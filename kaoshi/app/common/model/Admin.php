<?php
namespace app\common\model;

use think\Model;

class Admin extends Model
{
    protected $name = 'admin';
    protected $autoWriteTimestamp = true;

    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id', 'id');
    }
}
