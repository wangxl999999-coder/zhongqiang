<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../includes/Database.php';
require_once __DIR__ . '/../includes/helpers.php';

$db = Database::getInstance();
$config = require __DIR__ . '/../config/config.php';

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get_surveys':
        getSurveys($db);
        break;
    case 'get_survey':
        getSurvey($db);
        break;
    case 'create_survey':
        createSurvey($db);
        break;
    case 'create_from_template':
        createSurveyFromTemplate($db);
        break;
    case 'update_survey':
        updateSurvey($db);
        break;
    case 'delete_survey':
        deleteSurvey($db);
        break;
    case 'save_questions':
        saveQuestions($db);
        break;
    case 'save_conditions':
        saveConditions($db);
        break;
    case 'publish_survey':
        publishSurvey($db, $config);
        break;
    case 'get_public_survey':
        getPublicSurvey($db);
        break;
    case 'verify_password':
        verifyPassword($db);
        break;
    case 'submit_response':
        submitResponse($db);
        break;
    case 'get_responses':
        getResponses($db);
        break;
    case 'get_response_detail':
        getResponseDetail($db);
        break;
    case 'get_statistics':
        getStatistics($db);
        break;
    case 'export_excel':
        exportExcel($db);
        break;
    case 'export_csv':
        exportCsv($db);
        break;
    case 'upload_file':
        $result = handleFileUpload($_GET['question_id'] ?? 0);
        jsonResponse($result);
        break;
    case 'get_templates':
        getTemplates($db);
        break;
    case 'get_template':
        getTemplate($db);
        break;
    case 'save_as_template':
        saveAsTemplate($db);
        break;
    case 'get_collaborators':
        getCollaborators($db);
        break;
    case 'add_collaborator':
        addCollaborator($db);
        break;
    case 'update_collaborator':
        updateCollaborator($db);
        break;
    case 'remove_collaborator':
        removeCollaborator($db);
        break;
    case 'start_timer':
        startTimer($db);
        break;
    case 'check_timer':
        checkTimer($db);
        break;
    default:
        jsonResponse(['success' => false, 'message' => '未知操作']);
}

function getSurveys($db) {
    $surveys = $db->fetchAll('SELECT * FROM surveys ORDER BY created_at DESC');
    foreach ($surveys as &$survey) {
        $survey['question_count'] = $db->fetchOne(
            'SELECT COUNT(*) as count FROM questions WHERE survey_id = ?',
            [$survey['id']]
        )['count'];
        $survey['response_count'] = $db->fetchOne(
            'SELECT COUNT(*) as count FROM responses WHERE survey_id = ?',
            [$survey['id']]
        )['count'];
    }
    jsonResponse(['success' => true, 'data' => $surveys]);
}

function getSurvey($db) {
    $id = $_GET['id'] ?? 0;
    $survey = $db->fetchOne('SELECT * FROM surveys WHERE id = ?', [$id]);
    if (!$survey) {
        jsonResponse(['success' => false, 'message' => '问卷不存在']);
    }
    
    $questions = $db->fetchAll(
        'SELECT * FROM questions WHERE survey_id = ? ORDER BY page_number, sort_order',
        [$id]
    );
    
    foreach ($questions as &$question) {
        if (in_array($question['type'], ['radio', 'checkbox', 'select'])) {
            $question['options'] = $db->fetchAll(
                'SELECT * FROM options WHERE question_id = ? ORDER BY sort_order',
                [$question['id']]
            );
        }
        if ($question['config_json']) {
            $question['config'] = json_decode($question['config_json'], true);
        }
    }
    
    $conditions = $db->fetchAll(
        'SELECT * FROM conditions WHERE survey_id = ?',
        [$id]
    );
    
    jsonResponse(['success' => true, 'data' => [
        'survey' => $survey,
        'questions' => $questions,
        'conditions' => $conditions
    ]]);
}

function createSurvey($db) {
    $input = getInput();
    $title = sanitizeInput($input['title'] ?? '未命名问卷');
    
    $id = $db->insert('surveys', [
        'title' => $title,
        'description' => sanitizeInput($input['description'] ?? ''),
        'share_token' => generateToken(32)
    ]);
    
    jsonResponse(['success' => true, 'data' => ['id' => $id]]);
}

function updateSurvey($db) {
    $input = getInput();
    $id = $input['id'] ?? 0;
    
    $updateData = [
        'title' => sanitizeInput($input['title'] ?? '未命名问卷'),
        'description' => sanitizeInput($input['description'] ?? ''),
        'password' => !empty($input['password']) ? password_hash($input['password'], PASSWORD_DEFAULT) : null,
        'end_time' => $input['end_time'] ?? null,
        'max_responses' => !empty($input['max_responses']) ? intval($input['max_responses']) : null,
        'limit_once' => !empty($input['limit_once']) ? 1 : 0,
        'time_limit' => !empty($input['time_limit']) ? intval($input['time_limit']) : null,
        'ip_limit_type' => intval($input['ip_limit_type'] ?? 0),
        'ip_whitelist' => sanitizeInput($input['ip_whitelist'] ?? ''),
        'ip_blacklist' => sanitizeInput($input['ip_blacklist'] ?? ''),
    ];
    
    if (isset($input['password']) && $input['password'] === '') {
        $updateData['password'] = null;
    }
    
    $db->update('surveys', $updateData, 'id = :id', ['id' => $id]);
    
    jsonResponse(['success' => true]);
}

function deleteSurvey($db) {
    $input = getInput();
    $id = $input['id'] ?? 0;
    
    $db->delete('surveys', 'id = ?', [$id]);
    jsonResponse(['success' => true]);
}

function saveQuestions($db) {
    $input = getInput();
    $surveyId = $input['survey_id'] ?? 0;
    $questions = $input['questions'] ?? [];
    
    $db->delete('questions', 'survey_id = ?', [$surveyId]);
    
    foreach ($questions as $q) {
        $questionId = $db->insert('questions', [
            'survey_id' => $surveyId,
            'page_number' => intval($q['page_number'] ?? 1),
            'type' => $q['type'],
            'title' => sanitizeInput($q['title'] ?? ''),
            'description' => sanitizeInput($q['description'] ?? ''),
            'sort_order' => intval($q['sort_order'] ?? 0),
            'required' => !empty($q['required']) ? 1 : 0,
            'config_json' => !empty($q['config']) ? json_encode($q['config'], JSON_UNESCAPED_UNICODE) : null,
        ]);
        
        if (!empty($q['options']) && is_array($q['options'])) {
            foreach ($q['options'] as $idx => $opt) {
                $db->insert('options', [
                    'question_id' => $questionId,
                    'label' => sanitizeInput($opt['label'] ?? ''),
                    'value' => sanitizeInput($opt['value'] ?? ''),
                    'sort_order' => $idx,
                ]);
            }
        }
    }
    
    jsonResponse(['success' => true]);
}

function saveConditions($db) {
    $input = getInput();
    $surveyId = $input['survey_id'] ?? 0;
    $conditions = $input['conditions'] ?? [];
    
    $db->delete('conditions', 'survey_id = ?', [$surveyId]);
    
    foreach ($conditions as $cond) {
        $db->insert('conditions', [
            'survey_id' => $surveyId,
            'condition_type' => $cond['condition_type'],
            'trigger_question_id' => $cond['trigger_question_id'],
            'trigger_option_value' => $cond['trigger_option_value'] ?? null,
            'target_question_id' => $cond['target_question_id'] ?? null,
            'action' => $cond['action'] ?? 'jump',
        ]);
    }
    
    jsonResponse(['success' => true]);
}

function publishSurvey($db, $config) {
    $input = getInput();
    $id = $input['id'] ?? 0;
    $status = $input['status'] ?? 1;
    
    $survey = $db->fetchOne('SELECT * FROM surveys WHERE id = ?', [$id]);
    if (!$survey) {
        jsonResponse(['success' => false, 'message' => '问卷不存在']);
    }
    
    $shareUrl = $config['app']['url'] . '/view.php?token=' . $survey['share_token'];
    
    $db->update('surveys', ['status' => $status], 'id = :id', ['id' => $id]);
    
    jsonResponse(['success' => true, 'data' => [
        'share_url' => $shareUrl,
        'share_token' => $survey['share_token']
    ]]);
}

function getPublicSurvey($db) {
    $token = $_GET['token'] ?? '';
    
    $survey = $db->fetchOne('SELECT * FROM surveys WHERE share_token = ?', [$token]);
    if (!$survey) {
        jsonResponse(['success' => false, 'message' => '问卷不存在']);
    }
    
    $accessCheck = validateSurveyAccess($survey);
    if (!$accessCheck['success']) {
        jsonResponse($accessCheck);
    }
    
    $questions = $db->fetchAll(
        'SELECT * FROM questions WHERE survey_id = ? ORDER BY page_number, sort_order',
        [$survey['id']]
    );
    
    foreach ($questions as &$question) {
        if (in_array($question['type'], ['radio', 'checkbox', 'select'])) {
            $question['options'] = $db->fetchAll(
                'SELECT * FROM options WHERE question_id = ? ORDER BY sort_order',
                [$question['id']]
            );
        }
        if ($question['config_json']) {
            $question['config'] = json_decode($question['config_json'], true);
        }
    }
    
    $conditions = $db->fetchAll(
        'SELECT * FROM conditions WHERE survey_id = ?',
        [$survey['id']]
    );
    
    jsonResponse(['success' => true, 'data' => [
        'survey' => [
            'id' => $survey['id'],
            'title' => $survey['title'],
            'description' => $survey['description'],
            'cover_image' => $survey['cover_image'],
            'has_password' => !empty($survey['password']),
        ],
        'questions' => $questions,
        'conditions' => $conditions
    ]]);
}

function verifyPassword($db) {
    $input = getInput();
    $token = $input['token'] ?? '';
    $password = $input['password'] ?? '';
    
    $survey = $db->fetchOne('SELECT * FROM surveys WHERE share_token = ?', [$token]);
    if (!$survey) {
        jsonResponse(['success' => false, 'message' => '问卷不存在']);
    }
    
    if (password_verify($password, $survey['password'])) {
        jsonResponse(['success' => true]);
    }
    
    jsonResponse(['success' => false, 'message' => '密码错误']);
}

function submitResponse($db) {
    $input = getInput();
    $surveyId = $input['survey_id'] ?? 0;
    $answers = $input['answers'] ?? [];
    
    $survey = $db->fetchOne('SELECT * FROM surveys WHERE id = ?', [$surveyId]);
    if (!$survey) {
        jsonResponse(['success' => false, 'message' => '问卷不存在']);
    }
    
    $accessCheck = validateSurveyAccess($survey);
    if (!$accessCheck['success']) {
        jsonResponse($accessCheck);
    }
    
    $responseId = $db->insert('responses', [
        'survey_id' => $surveyId,
        'ip_address' => $_SERVER['REMOTE_ADDR'],
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
    ]);
    
    foreach ($answers as $questionId => $answerValue) {
        if (is_array($answerValue)) {
            $answerValue = json_encode($answerValue, JSON_UNESCAPED_UNICODE);
        }
        $db->insert('answers', [
            'response_id' => $responseId,
            'question_id' => $questionId,
            'answer_value' => $answerValue,
        ]);
    }
    
    jsonResponse(['success' => true, 'data' => ['response_id' => $responseId]]);
}

function getResponses($db) {
    $surveyId = $_GET['survey_id'] ?? 0;
    $page = intval($_GET['page'] ?? 1);
    $pageSize = intval($_GET['page_size'] ?? 20);
    $offset = ($page - 1) * $pageSize;
    
    $total = $db->fetchOne(
        'SELECT COUNT(*) as count FROM responses WHERE survey_id = ?',
        [$surveyId]
    )['count'];
    
    $responses = $db->fetchAll(
        'SELECT * FROM responses WHERE survey_id = ? ORDER BY submit_time DESC LIMIT ? OFFSET ?',
        [$surveyId, $pageSize, $offset]
    );
    
    jsonResponse(['success' => true, 'data' => [
        'total' => $total,
        'page' => $page,
        'page_size' => $pageSize,
        'items' => $responses
    ]]);
}

function getResponseDetail($db) {
    $responseId = $_GET['response_id'] ?? 0;
    
    $response = $db->fetchOne('SELECT * FROM responses WHERE id = ?', [$responseId]);
    if (!$response) {
        jsonResponse(['success' => false, 'message' => '答卷不存在']);
    }
    
    $answers = $db->fetchAll(
        'SELECT a.*, q.title, q.type FROM answers a 
         LEFT JOIN questions q ON a.question_id = q.id 
         WHERE a.response_id = ?',
        [$responseId]
    );
    
    jsonResponse(['success' => true, 'data' => [
        'response' => $response,
        'answers' => $answers
    ]]);
}

function getStatistics($db) {
    $surveyId = $_GET['survey_id'] ?? 0;
    
    $questions = $db->fetchAll(
        'SELECT * FROM questions WHERE survey_id = ? AND type IN ("radio", "checkbox", "select", "rating") ORDER BY sort_order',
        [$surveyId]
    );
    
    $statistics = [];
    
    foreach ($questions as $question) {
        $stat = [
            'question_id' => $question['id'],
            'question_title' => $question['title'],
            'type' => $question['type'],
            'options' => [],
            'counts' => [],
        ];
        
        if (in_array($question['type'], ['radio', 'checkbox', 'select'])) {
            $options = $db->fetchAll(
                'SELECT * FROM options WHERE question_id = ? ORDER BY sort_order',
                [$question['id']]
            );
            
            $allAnswers = $db->fetchAll(
                'SELECT answer_value FROM answers WHERE question_id = ?',
                [$question['id']]
            );
            
            $counts = [];
            $total = 0;
            
            foreach ($options as $opt) {
                $counts[$opt['value']] = 0;
                $stat['options'][] = ['label' => $opt['label'], 'value' => $opt['value']];
            }
            
            foreach ($allAnswers as $ans) {
                $val = $ans['answer_value'];
                if ($question['type'] === 'checkbox') {
                    $arr = json_decode($val, true);
                    if (is_array($arr)) {
                        foreach ($arr as $v) {
                            if (isset($counts[$v])) {
                                $counts[$v]++;
                                $total++;
                            }
                        }
                    }
                } else {
                    if (isset($counts[$val])) {
                        $counts[$val]++;
                        $total++;
                    }
                }
            }
            
            foreach ($options as $opt) {
                $stat['counts'][] = [
                    'label' => $opt['label'],
                    'value' => $opt['value'],
                    'count' => $counts[$opt['value']],
                    'percent' => $total > 0 ? round($counts[$opt['value']] / $total * 100, 2) : 0
                ];
            }
        } elseif ($question['type'] === 'rating') {
            $config = $question['config_json'] ? json_decode($question['config_json'], true) : [];
            $max = $config['max'] ?? 5;
            $min = $config['min'] ?? 1;
            
            $allAnswers = $db->fetchAll(
                'SELECT answer_value FROM answers WHERE question_id = ?',
                [$question['id']]
            );
            
            $counts = array_fill($min, $max - $min + 1, 0);
            $total = 0;
            $sum = 0;
            
            foreach ($allAnswers as $ans) {
                $val = intval($ans['answer_value']);
                if ($val >= $min && $val <= $max) {
                    $counts[$val]++;
                    $total++;
                    $sum += $val;
                }
            }
            
            for ($i = $min; $i <= $max; $i++) {
                $stat['counts'][] = [
                    'label' => $i . '分',
                    'value' => $i,
                    'count' => $counts[$i],
                    'percent' => $total > 0 ? round($counts[$i] / $total * 100, 2) : 0
                ];
            }
            
            $stat['average'] = $total > 0 ? round($sum / $total, 2) : 0;
        }
        
        $statistics[] = $stat;
    }
    
    $totalResponses = $db->fetchOne(
        'SELECT COUNT(*) as count FROM responses WHERE survey_id = ?',
        [$surveyId]
    )['count'];
    
    jsonResponse(['success' => true, 'data' => [
        'total_responses' => $totalResponses,
        'statistics' => $statistics
    ]]);
}

function exportExcel($db) {
    $surveyId = $_GET['survey_id'] ?? 0;
    
    $survey = $db->fetchOne('SELECT * FROM surveys WHERE id = ?', [$surveyId]);
    $questions = $db->fetchAll(
        'SELECT * FROM questions WHERE survey_id = ? ORDER BY sort_order',
        [$surveyId]
    );
    $responses = $db->fetchAll(
        'SELECT * FROM responses WHERE survey_id = ? ORDER BY submit_time',
        [$surveyId]
    );
    
    header('Content-Type: application/vnd.ms-excel; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $survey['title'] . '_答卷.xls"');
    
    echo '<html><head><meta charset="utf-8"></head><body><table border="1">';
    
    echo '<tr>';
    echo '<th>序号</th>';
    echo '<th>提交时间</th>';
    foreach ($questions as $q) {
        echo '<th>' . htmlspecialchars($q['title']) . '</th>';
    }
    echo '</tr>';
    
    foreach ($responses as $idx => $resp) {
        echo '<tr>';
        echo '<td>' . ($idx + 1) . '</td>';
        echo '<td>' . $resp['submit_time'] . '</td>';
        
        foreach ($questions as $q) {
            $answer = $db->fetchOne(
                'SELECT answer_value FROM answers WHERE response_id = ? AND question_id = ?',
                [$resp['id'], $q['id']]
            );
            
            $val = '';
            if ($answer) {
                if ($q['type'] === 'checkbox') {
                    $arr = json_decode($answer['answer_value'], true);
                    if (is_array($arr)) {
                        $labels = [];
                        foreach ($arr as $v) {
                            $opt = $db->fetchOne(
                                'SELECT label FROM options WHERE question_id = ? AND value = ?',
                                [$q['id'], $v]
                            );
                            $labels[] = $opt ? $opt['label'] : $v;
                        }
                        $val = implode(', ', $labels);
                    }
                } elseif (in_array($q['type'], ['radio', 'select'])) {
                    $opt = $db->fetchOne(
                        'SELECT label FROM options WHERE question_id = ? AND value = ?',
                        [$q['id'], $answer['answer_value']]
                    );
                    $val = $opt ? $opt['label'] : $answer['answer_value'];
                } else {
                    $val = $answer['answer_value'];
                }
            }
            echo '<td>' . htmlspecialchars($val) . '</td>';
        }
        echo '</tr>';
    }
    
    echo '</table></body></html>';
    exit;
}

function exportCsv($db) {
    $surveyId = $_GET['survey_id'] ?? 0;
    
    $survey = $db->fetchOne('SELECT * FROM surveys WHERE id = ?', [$surveyId]);
    $questions = $db->fetchAll(
        'SELECT * FROM questions WHERE survey_id = ? ORDER BY sort_order',
        [$surveyId]
    );
    $responses = $db->fetchAll(
        'SELECT * FROM responses WHERE survey_id = ? ORDER BY submit_time',
        [$surveyId]
    );
    
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $survey['title'] . '_答卷.csv"');
    
    $fp = fopen('php://output', 'w');
    fprintf($fp, chr(0xEF).chr(0xBB).chr(0xBF));
    
    $headers = ['序号', '提交时间'];
    foreach ($questions as $q) {
        $headers[] = $q['title'];
    }
    fputcsv($fp, $headers);
    
    foreach ($responses as $idx => $resp) {
        $row = [$idx + 1, $resp['submit_time']];
        
        foreach ($questions as $q) {
            $answer = $db->fetchOne(
                'SELECT answer_value FROM answers WHERE response_id = ? AND question_id = ?',
                [$resp['id'], $q['id']]
            );
            
            $val = '';
            if ($answer) {
                if ($q['type'] === 'checkbox') {
                    $arr = json_decode($answer['answer_value'], true);
                    if (is_array($arr)) {
                        $labels = [];
                        foreach ($arr as $v) {
                            $opt = $db->fetchOne(
                                'SELECT label FROM options WHERE question_id = ? AND value = ?',
                                [$q['id'], $v]
                            );
                            $labels[] = $opt ? $opt['label'] : $v;
                        }
                        $val = implode(', ', $labels);
                    }
                } elseif (in_array($q['type'], ['radio', 'select'])) {
                    $opt = $db->fetchOne(
                        'SELECT label FROM options WHERE question_id = ? AND value = ?',
                        [$q['id'], $answer['answer_value']]
                    );
                    $val = $opt ? $opt['label'] : $answer['answer_value'];
                } else {
                    $val = $answer['answer_value'];
                }
            }
            $row[] = $val;
        }
        fputcsv($fp, $row);
    }
    
    fclose($fp);
    exit;
}

function getTemplates($db) {
    $category = $_GET['category'] ?? '';
    
    $sql = 'SELECT * FROM templates WHERE is_public = 1';
    $params = [];
    
    if ($category) {
        $sql .= ' AND category = ?';
        $params[] = $category;
    }
    
    $sql .= ' ORDER BY usage_count DESC';
    $templates = $db->fetchAll($sql, $params);
    
    jsonResponse(['success' => true, 'data' => $templates]);
}

function getTemplate($db) {
    $id = $_GET['id'] ?? 0;
    $template = $db->fetchOne('SELECT * FROM templates WHERE id = ?', [$id]);
    
    if (!$template) {
        jsonResponse(['success' => false, 'message' => '模板不存在']);
    }
    
    $template['data'] = json_decode($template['template_data'], true);
    
    jsonResponse(['success' => true, 'data' => $template]);
}

function createSurveyFromTemplate($db) {
    $input = getInput();
    $templateId = $input['template_id'] ?? 0;
    
    $template = $db->fetchOne('SELECT * FROM templates WHERE id = ?', [$templateId]);
    
    if (!$template) {
        jsonResponse(['success' => false, 'message' => '模板不存在']);
    }
    
    $templateData = json_decode($template['template_data'], true);
    
    $surveyData = $templateData['survey'] ?? [];
    $questions = $templateData['questions'] ?? [];
    
    $surveyId = $db->insert('surveys', [
        'title' => $surveyData['title'] ?? '未命名问卷',
        'description' => $surveyData['description'] ?? '',
        'share_token' => generateToken(32)
    ]);
    
    foreach ($questions as $q) {
        $questionId = $db->insert('questions', [
            'survey_id' => $surveyId,
            'page_number' => intval($q['page_number'] ?? 1),
            'type' => $q['type'],
            'title' => sanitizeInput($q['title'] ?? ''),
            'description' => sanitizeInput($q['description'] ?? ''),
            'sort_order' => intval($q['sort_order'] ?? 0),
            'required' => !empty($q['required']) ? 1 : 0,
            'config_json' => !empty($q['config']) ? json_encode($q['config'], JSON_UNESCAPED_UNICODE) : null,
        ]);
        
        if (!empty($q['options']) && is_array($q['options'])) {
            foreach ($q['options'] as $idx => $opt) {
                $db->insert('options', [
                    'question_id' => $questionId,
                    'label' => sanitizeInput($opt['label'] ?? ''),
                    'value' => sanitizeInput($opt['value'] ?? ''),
                    'sort_order' => $idx,
                ]);
            }
        }
    }
    
    $db->update('templates', 
        ['usage_count' => $template['usage_count'] + 1], 
        'id = :id', 
        ['id' => $templateId]
    );
    
    jsonResponse(['success' => true, 'data' => ['id' => $surveyId]]);
}

function saveAsTemplate($db) {
    $input = getInput();
    $surveyId = $input['survey_id'] ?? 0;
    $title = $input['title'] ?? '';
    $description = $input['description'] ?? '';
    $category = $input['category'] ?? 'other';
    
    $survey = $db->fetchOne('SELECT * FROM surveys WHERE id = ?', [$surveyId]);
    if (!$survey) {
        jsonResponse(['success' => false, 'message' => '问卷不存在']);
    }
    
    $questions = $db->fetchAll(
        'SELECT * FROM questions WHERE survey_id = ? ORDER BY page_number, sort_order',
        [$surveyId]
    );
    
    foreach ($questions as &$question) {
        if (in_array($question['type'], ['radio', 'checkbox', 'select'])) {
            $question['options'] = $db->fetchAll(
                'SELECT * FROM options WHERE question_id = ? ORDER BY sort_order',
                [$question['id']]
            );
        }
        if ($question['config_json']) {
            $question['config'] = json_decode($question['config_json'], true);
        }
        unset($question['id']);
        unset($question['survey_id']);
        unset($question['config_json']);
        if (isset($question['options'])) {
            foreach ($question['options'] as &$opt) {
                unset($opt['id']);
                unset($opt['question_id']);
            }
        }
    }
    
    $templateData = json_encode([
        'survey' => [
            'title' => $survey['title'],
            'description' => $survey['description']
        ],
        'questions' => $questions
    ], JSON_UNESCAPED_UNICODE);
    
    $templateId = $db->insert('templates', [
        'title' => sanitizeInput($title),
        'description' => sanitizeInput($description),
        'category' => $category,
        'template_data' => $templateData,
        'is_public' => 0
    ]);
    
    jsonResponse(['success' => true, 'data' => ['id' => $templateId]]);
}

function getCollaborators($db) {
    $surveyId = $_GET['survey_id'] ?? 0;
    
    $collaborators = $db->fetchAll(
        'SELECT c.*, u.username, u.nickname, u.avatar 
         FROM survey_collaborators c 
         LEFT JOIN users u ON c.user_id = u.id 
         WHERE c.survey_id = ?',
        [$surveyId]
    );
    
    jsonResponse(['success' => true, 'data' => $collaborators]);
}

function addCollaborator($db) {
    $input = getInput();
    $surveyId = $input['survey_id'] ?? 0;
    $username = $input['username'] ?? '';
    $role = $input['role'] ?? 'editor';
    $permissionLevel = $input['permission_level'] ?? 2;
    
    $user = $db->fetchOne('SELECT id FROM users WHERE username = ?', [$username]);
    if (!$user) {
        $password = generateToken(8);
        $userId = $db->insert('users', [
            'username' => sanitizeInput($username),
            'password' => password_hash($password, PASSWORD_DEFAULT),
            'nickname' => sanitizeInput($username)
        ]);
    } else {
        $userId = $user['id'];
    }
    
    $existing = $db->fetchOne(
        'SELECT id FROM survey_collaborators WHERE survey_id = ? AND user_id = ?',
        [$surveyId, $userId]
    );
    
    if ($existing) {
        jsonResponse(['success' => false, 'message' => '该用户已是协作成员']);
    }
    
    $db->insert('survey_collaborators', [
        'survey_id' => $surveyId,
        'user_id' => $userId,
        'role' => $role,
        'permission_level' => $permissionLevel
    ]);
    
    jsonResponse(['success' => true, 'data' => ['user_id' => $userId]]);
}

function updateCollaborator($db) {
    $input = getInput();
    $id = $input['id'] ?? 0;
    $role = $input['role'] ?? 'editor';
    $permissionLevel = $input['permission_level'] ?? 2;
    
    $db->update('survey_collaborators', [
        'role' => $role,
        'permission_level' => $permissionLevel
    ], 'id = :id', ['id' => $id]);
    
    jsonResponse(['success' => true]);
}

function removeCollaborator($db) {
    $input = getInput();
    $id = $input['id'] ?? 0;
    
    $db->delete('survey_collaborators', 'id = ?', [$id]);
    jsonResponse(['success' => true]);
}

function startTimer($db) {
    $input = getInput();
    $surveyId = $input['survey_id'] ?? 0;
    $token = $input['token'] ?? '';
    
    $survey = $db->fetchOne('SELECT * FROM surveys WHERE share_token = ?', [$token]);
    if (!$survey) {
        jsonResponse(['success' => false, 'message' => '问卷不存在']);
    }
    
    if (!$survey['time_limit']) {
        jsonResponse(['success' => true, 'data' => ['time_limit' => null]]);
        return;
    }
    
    $sessionKey = 'survey_' . $survey['id'] . '_start_time';
    if (!isset($_SESSION)) {
        session_start();
    }
    
    $startTime = time();
    $_SESSION[$sessionKey] = $startTime;
    
    jsonResponse([
        'success' => true,
        'data' => [
            'time_limit' => $survey['time_limit'],
            'start_time' => $startTime,
            'end_time' => $startTime + $survey['time_limit'] * 60
        ]
    ]);
}

function checkTimer($db) {
    $input = getInput();
    $token = $input['token'] ?? '';
    
    $survey = $db->fetchOne('SELECT * FROM surveys WHERE share_token = ?', [$token]);
    if (!$survey) {
        jsonResponse(['success' => false, 'message' => '问卷不存在']);
    }
    
    if (!$survey['time_limit']) {
        jsonResponse(['success' => true, 'data' => ['remaining' => null, 'expired' => false]]);
        return;
    }
    
    if (!isset($_SESSION)) {
        session_start();
    }
    
    $sessionKey = 'survey_' . $survey['id'] . '_start_time';
    $startTime = $_SESSION[$sessionKey] ?? time();
    $endTime = $startTime + $survey['time_limit'] * 60;
    $remaining = $endTime - time();
    $expired = $remaining <= 0;
    
    jsonResponse([
        'success' => true,
        'data' => [
            'remaining' => max(0, $remaining),
            'expired' => $expired,
            'time_limit' => $survey['time_limit']
        ]
    ]);
}
