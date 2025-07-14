document.addEventListener('DOMContentLoaded', () => {
	let cart = [];
	let cartTotal = 0;
	let orderPlacedOver50 = false;

	const menu = document.querySelector('#menu-btn');
	const navbar = document.querySelector('.navbar');

	menu.onclick = () => {
		menu.classList.toggle('fa-times');
		navbar.classList.toggle('active');
	}

	window.onscroll = () => {
		menu.classList.remove('fa-times');
		navbar.classList.remove('active');
	};

	document.querySelectorAll('.image-slider img').forEach(image => {
		image.onclick = () => {
			const src = image.getAttribute('src');
			document.querySelector('.main-home-image').src = src;
		};
	});

	const bookTableButton = document.querySelector('.cart-btn').previousElementSibling;
	if (bookTableButton) {
		bookTableButton.addEventListener('click', (e) => {
			e.preventDefault();
			document.querySelector('.book').scrollIntoView({ behavior: 'smooth' });
		});
	}

	const swiper = new Swiper(".review-slider", {
		spaceBetween: 20,
		pagination: {
			el: ".swiper-pagination",
			clickable: true,
		},
		loop: true,
		grabCursor: true,
		autoplay: {
			delay: 7500,
			disableOnInteraction: false,
		},
		breakpoints: {
			0: {
				slidesPerView: 1,
			},
			768: {
				slidesPerView: 2,
			},
		},
	});

	document.querySelectorAll('.menu .box').forEach(box => {
		box.addEventListener('click', (e) => {
			e.preventDefault();

			const nameElement = box.querySelector('.coffee-item');
			const name = nameElement ? nameElement.textContent.trim() : 'Unknown Item';
			const priceText = box.querySelector('.price span') ? box.querySelector('.price span').textContent.trim() : '$0.00';
			const price = parseFloat(priceText.replace('$', '')) || 0;

			const originalImg = box.querySelector('img');
			if (!originalImg) return;

			const clone = originalImg.cloneNode(true);

			clone.style.position = 'fixed';
			clone.style.width = `${originalImg.offsetWidth}px`;
			clone.style.height = `${originalImg.offsetHeight}px`;
			const rect = originalImg.getBoundingClientRect();
			clone.style.top = `${rect.top}px`;
			clone.style.left = `${rect.left}px`;
			clone.style.zIndex = '1000';
			clone.style.transition = 'all 1s ease-in-out';

			document.body.appendChild(clone);

			const cartIcon = document.querySelector('.cart-btn');
			const cartRect = cartIcon.getBoundingClientRect();

			const keyframes = [
				{
					top: `${rect.top}px`,
					left: `${rect.left}px`,
					transform: 'scale(1)',
					opacity: 1
				},
				{
					top: `${cartRect.top / 2}px`,
					left: `${cartRect.left}px`,
					transform: 'scale(0.5)',
					opacity: 0.5
				},
				{
					top: `${cartRect.top}px`,
					left: `${cartRect.left}px`,
					transform: 'scale(0.1)',
					opacity: 0
				}
			];

			const timing = {
				duration: 1000,
				easing: 'ease-in-out'
			};

			const animation = clone.animate(keyframes, timing);
			animation.onfinish = () => {
				document.body.removeChild(clone);
				addToCart(name, price);
			};
		});
	});

	function addToCart(name, price) {
		const existingItem = cart.find(item => item.name === name);
		if (existingItem) {
			existingItem.quantity++;
		} else {
			cart.push({
				name: name,
				price: price,
				quantity: 1
			});
		}

		updateCart();
	}

	function updateCart() {
		const cartItems = document.querySelector('.cart-items');
		if (!cartItems) return;
		cartItems.innerHTML = '';
		cartTotal = 0;

		cart.forEach(item => {
			const itemTotal = item.price * item.quantity;
			cartTotal += itemTotal;

			const cartItem = document.createElement('div');
			cartItem.classList.add('cart-item');

			cartItem.innerHTML = `
			<div>
				<h4>${item.name}</h4>
				<p>$${itemTotal.toFixed(2)}</p>
			</div>
			<div class="quantity-controls">
				<span class="quantity-btn minus" onclick="updateQuantity('${item.name}', -1)">-</span>
				<span>${item.quantity}</span>
				<span class="quantity-btn plus" onclick="updateQuantity('${item.name}', 1)">+</span>
			</div>
			`;

			cartItems.appendChild(cartItem);
		});

		const cartTotalElements = document.querySelectorAll('.cart-total, .modal-cart-total');
		cartTotalElements.forEach(elem => {
			elem.textContent = `$${cartTotal.toFixed(2)}`;
		});

	}

	window.updateQuantity = function (name, change) {
		const item = cart.find(item => item.name === name);
		if (item) {
			item.quantity += change;
			if (item.quantity <= 0) {
				cart = cart.filter(i => i.name !== name);
			}
			updateCart();
		}
	}

	const cartButton = document.querySelector('.cart-btn');
	if (cartButton) {
		cartButton.addEventListener('click', () => {
			const cartModal = document.querySelector('.cart-modal');
			if (cartModal) {
				cartModal.classList.toggle('active');
			}
		});
	}

	function placeOrder() {
		if (cart.length === 0) {
			alert('Ваша корзина пуста.');
			return;
		}

		const orderData = cart.map(item => ({
			name: item.name,
			quantity: item.quantity
		}));
		const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

		fetch('Orders.php', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: `cart=${encodeURIComponent(JSON.stringify(orderData))}&totalPrice=${encodeURIComponent(totalPrice)}`
		})
			.then(response => response.text())
			.then(data => {
				alert(data);

				if (totalPrice >= 50) {
					enableCreateButton();
				}

				cart = [];
				updateCart();

				updateCheckoutButton();
			})
			.catch(error => {
				console.error('Ошибка:', error);
				alert('Произошла ошибка при оформлении заказа.');
			});
	}

	function updateCheckoutButton() {
		const checkoutBtn = document.querySelector('.checkout-btn:not(.create-btn)');
		if (!checkoutBtn) return;
		checkoutBtn.textContent = 'Order Placed';
		checkoutBtn.style.backgroundColor = '#cccccc';
		checkoutBtn.disabled = true;

		setTimeout(() => {
			checkoutBtn.textContent = 'Place order';
			checkoutBtn.style.backgroundColor = '#6a994e';
			checkoutBtn.disabled = false;
		}, 5000);
	}

	function enableCreateButton() {
		const createBtn = document.getElementById('createButton');
		if (!createBtn) return;
		createBtn.textContent = 'Create';
		createBtn.classList.add('enabled');
		createBtn.disabled = false;
		createBtn.style.backgroundColor = '#6a994e';
		createBtn.style.cursor = 'pointer';

		if (!createBtn.classList.contains('click-handler-added')) {
			createBtn.addEventListener('click', createPromoCode);
			createBtn.classList.add('click-handler-added');
		}
	}

	function createPromoCode() {
		fetch('promo.php', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ timestamp: new Date().getTime() })
		})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					const promoCodeContainer = document.getElementById('promoCodeContainer');
					const promoCodeInput = document.getElementById('promoCode');
					if (promoCodeInput && promoCodeContainer) {
						promoCodeInput.value = data.promo_code;
						promoCodeContainer.style.display = 'block';
					}

					const createBtn = document.getElementById('createButton');
					if (createBtn) {
						createBtn.textContent = 'Created';
						createBtn.disabled = true;
						createBtn.style.cursor = 'not-allowed';
						createBtn.style.backgroundColor = '#cccccc';

						createBtn.removeEventListener('click', createPromoCode);
						createBtn.classList.remove('click-handler-added');
					}
				} else {
					alert('Ошибка при генерации промокода: ' + data.message);
				}
			})
			.catch(error => {
				console.error('Ошибка:', error);
				alert('Произошла ошибка при генерации промокода.');
			});
	}

	const placeOrderButton = document.querySelector('.checkout-btn:not(.create-btn)');
	if (placeOrderButton) {
		placeOrderButton.addEventListener('click', (e) => {
			e.preventDefault();
			placeOrder();
		});
	}

	(function initialize() {
		const createBtn = document.getElementById('createButton');
		if (createBtn) {
			createBtn.textContent = 'Unavailable';
			createBtn.classList.remove('enabled');
			createBtn.disabled = true;
			createBtn.style.cursor = 'not-allowed';
			createBtn.style.backgroundColor = '#cccccc';
		}

		const promoCodeContainer = document.getElementById('promoCodeContainer');
		if (promoCodeContainer) {
			promoCodeContainer.style.display = 'none';
		}

		updateCart();
	})();

	const bookingForm = document.getElementById('form[action="booking.php"]');
	const bookingMessage = document.getElementById('bookingMessage');
	document.querySelector('form[action="booking.php"]').addEventListener('submit', function (event) {
		event.preventDefault();

		const formData = new FormData(this);
		fetch('booking.php', {
			method: 'POST',
			body: formData
		})
			.then(response => response.json())
			.then(data => {
				const messageBox = document.createElement('div');
				messageBox.className = 'message-box';

				if (data.status === 'success') {
					messageBox.style.color = 'green';
				} else {
					messageBox.style.color = 'red';
				}

				messageBox.textContent = data.message;
				this.appendChild(messageBox);

				setTimeout(() => {
					messageBox.remove();
				}, 5000);

				if (data.status === 'success') {
					this.reset();
				}
			})
			.catch(error => {
				console.error('Ошибка:', error);
				alert('Произошла ошибка при отправке формы.');
			});
	});


	if (bookingForm && bookingMessage) {
		bookingForm.addEventListener('submit', async function (event) {
			event.preventDefault();

			const existingMessage = bookingForm.querySelector('.message-box');
			if (existingMessage) {
				existingMessage.remove();
			}

			const formData = new FormData(this);
			try {
				const response = await fetch('booking.php', {
					method: 'POST',
					body: formData
				});

				if (!response.ok) {
					throw new Error('Сетевая ошибка');
				}

				const data = await response.json();
				const messageBox = document.createElement('div');
				messageBox.className = 'message-box';
				messageBox.textContent = data.message;

				if (data.status === 'success') {
					messageBox.style.color = 'green';
					this.reset();
				} else {
					messageBox.style.color = 'red';
				}

				this.appendChild(messageBox);
				setTimeout(() => {
					messageBox.remove();
				}, 5000);

			} catch (error) {
				console.error('Ошибка:', error);
				alert('Произошла ошибка при отправке формы.');
			}
		});
	}
});
