<?php
namespace app\common\model;

use think\Model;

class Knowledge extends Model
{
    protected $name = 'knowledge';
    protected $autoWriteTimestamp = true;

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subject_id', 'id');
    }

    public function chapter()
    {
        return $this->belongsTo(Chapter::class, 'chapter_id', 'id');
    }
}
