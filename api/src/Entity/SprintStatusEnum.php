<?php

namespace App\Entity;

enum SprintStatusEnum: string
{
    case CREATED = 'created';
    case STARTED = 'started';
    case COMPLETED = 'completed';
}
