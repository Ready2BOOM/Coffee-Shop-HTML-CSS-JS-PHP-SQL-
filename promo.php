<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	$input = json_decode(file_get_contents('php://input'), true);
	if (!$input) {
		echo json_encode(['success' => false, 'message' => 'Неверный формат данных.']);
		exit;
	}

	$characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	$promo_code = '';
	for ($i = 0; $i < 8; $i++) {
		$promo_code .= $characters[random_int(0, strlen($characters) - 1)];
	}

	$servername = "localhost";
	$username = "root";
	$password = "aaaa";
	$dbname = "curse";

	$conn = new mysqli($servername, $username, $password, $dbname);

	if ($conn->connect_error) {
		echo json_encode(['success' => false, 'message' => 'Ошибка подключения к базе данных.']);
		exit;
	}

	$conn->set_charset("utf8");

	$stmt = $conn->prepare("SELECT id FROM promo WHERE code = ?");
	$stmt->bind_param("s", $promo_code);
	$stmt->execute();
	$stmt->store_result();
	if ($stmt->num_rows > 0) {
		$stmt->close();
		$conn->close();
		echo json_encode(['success' => false, 'message' => 'Ошибка генерации промокода. Попробуйте снова.']);
		exit;
	}
	$stmt->close();

	$stmt = $conn->prepare("INSERT INTO promo (code, created_at, expires_at) VALUES (?, NOW(), DATE_ADD(NOW(), INTERVAL 1 HOUR))");
	if (!$stmt) {
		echo json_encode(['success' => false, 'message' => 'Ошибка подготовки запроса.']);
		$conn->close();
		exit;
	}

	$stmt->bind_param("s", $promo_code);

	if ($stmt->execute()) {
		echo json_encode(['success' => true, 'promo_code' => $promo_code]);
	} else {
		echo json_encode(['success' => false, 'message' => 'Ошибка при сохранении промокода.']);
	}

	$stmt->close();
	$conn->close();
} else {
	echo json_encode(['success' => false, 'message' => 'Некорректный метод запроса.']);
}
?>