<?php
header('Content-Type: text/plain; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	$cart = isset($_POST['cart']) ? $_POST['cart'] : '';
	$totalPrice = isset($_POST['totalPrice']) ? $_POST['totalPrice'] : '';

	if (empty($cart) || empty($totalPrice)) {
		echo "Некорректные данные заказа.";
		exit;
	}

	$cart = json_decode($cart, true);
	if ($cart === null) {
		echo "Ошибка декодирования данных корзины.";
		exit;
	}

	$servername = "localhost";
	$username = "root";
	$password = "aaaa";
	$dbname = "curse";

	$conn = new mysqli($servername, $username, $password, $dbname);

	if ($conn->connect_error) {
		echo "Ошибка подключения к базе данных: " . $conn->connect_error;
		exit;
	}

	$conn->set_charset("utf8");

	$stmt = $conn->prepare("INSERT INTO orders (items, total_price, order_date) VALUES (?, ?, NOW())");
	if (!$stmt) {
		echo "Ошибка подготовки запроса: " . $conn->error;
		$conn->close();
		exit;
	}

	$itemsJson = json_encode($cart);

	$stmt->bind_param("sd", $itemsJson, $totalPrice);

	if ($stmt->execute()) {
		echo "Ваш заказ успешно оформлен!";
	} else {
		echo "Ошибка при оформлении заказа: " . $stmt->error;
	}

	$stmt->close();
	$conn->close();
} else {
	echo "Некорректный метод запроса.";
}
?>