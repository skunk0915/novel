function setBackgroundColorFromImage(img, link) {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	img.onload = function () {
		canvas.width = img.width;
		canvas.height = img.height;
		ctx.drawImage(img, 0, 0, img.width, img.height);

		const imageData = ctx.getImageData(0, 0, 1, 1);
		const [r, g, b] = imageData.data;

		link.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;

		// オプション: コントラストの高いテキスト色を設定
		const brightness = (r * 299 + g * 587 + b * 114) / 1000;
		link.style.color = brightness > 128 ? 'black' : 'white';
	};
}

// すべての関連画像に対して処理を適用
document.querySelectorAll('.related-post').forEach(post => {
	const img = post.querySelector('.related-image');
	const link = post.querySelector('.related-link');
	setBackgroundColorFromImage(img, link);
});