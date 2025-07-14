<?php
header('Content-Type: application/json');

$servername = "localhost";
$username = "root";
$password = "aaaa";
$dbname = "curse";

try {
	$dsn = "mysql:host=$servername;dbname=$dbname;charset=utf8mb4";
	$options = [
		PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
		PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
		PDO::ATTR_EMULATE_PREPARES => false,
	];
	$pdo = new PDO($dsn, $username, $password, $options);
} catch (PDOException $e) {
	echo json_encode(['status' => 'error', 'message' => 'Ошибка подключения к базе данных.']);
	exit();
}

$name = isset($_POST["name"]) ? trim($_POST["name"]) : '';
$email = isset($_POST["email"]) ? trim($_POST["email"]) : '';
$phone = isset($_POST["phone"]) ? trim($_POST["phone"]) : '';
$message = isset($_POST["message"]) ? trim($_POST["message"]) : '';
$reservationDate = isset($_POST["reservationDate"]) ? trim($_POST["reservationDate"]) : '';
$reservationTime = isset($_POST["reservationTime"]) ? trim($_POST["reservationTime"]) : '';

if (empty($name) || empty($email) || empty($phone) || empty($message) || empty($reservationDate) || empty($reservationTime)) {
	echo json_encode(['status' => 'error', 'message' => 'Все поля обязательны для заполнения!']);
	exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
	echo json_encode(['status' => 'error', 'message' => 'Неверный формат email.']);
	exit();
}

if (!preg_match('/^[0-9\-\/\+\s]+$/', $phone)) {
	echo json_encode(['status' => 'error', 'message' => 'Неверный формат номера телефона.']);
	exit();
}

if (!validateDate($reservationDate, 'Y-m-d')) {
	echo json_encode(['status' => 'error', 'message' => 'Неверный формат даты бронирования.']);
	exit();
}

if (!validateDate($reservationTime, 'H:i')) {
	echo json_encode(['status' => 'error', 'message' => 'Неверный формат времени бронирования.']);
	exit();
}

function validateDate($date, $format = 'Y-m-d')
{
	$d = DateTime::createFromFormat($format, $date);
	return $d && $d->format($format) === $date;
}

try {
	$stmt = $pdo->prepare("INSERT INTO bookings (name, email, phone, message, reservation_date, reservation_time) VALUES (:name, :email, :phone, :message, :reservation_date, :reservation_time)");
	$stmt->bindParam(':name', $name, PDO::PARAM_STR);
	$stmt->bindParam(':email', $email, PDO::PARAM_STR);
	$stmt->bindParam(':phone', $phone, PDO::PARAM_STR);
	$stmt->bindParam(':message', $message, PDO::PARAM_STR);
	$stmt->bindParam(':reservation_date', $reservationDate, PDO::PARAM_STR);
	$stmt->bindParam(':reservation_time', $reservationTime, PDO::PARAM_STR);
	$stmt->execute();
	echo json_encode(['status' => 'success', 'message' => 'Бронирование успешно сохранено!']);
} catch (PDOException $e) {
	echo json_encode(['status' => 'error', 'message' => 'Ошибка при сохранении бронирования.']);
	exit();
}
?>