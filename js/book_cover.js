window.addEventListener('load', function () {
	// const articleImg = document.querySelector('.article_img');
	// if (articleImg) {
	// 	setTimeout(function () {
	// 		articleImg.classList.add('fade-out');
	// 		setTimeout(function () {
	// 			articleImg.classList.add('hidden');
	// 		}, 500);
	// 	}, 500);
	// }

});

document.addEventListener('DOMContentLoaded', function() {
	function setBackgroundColorFromImage(img, link) {
	  if (!img || !link) {
		console.warn('Image or link element not found');
		return;
	  }
  
	  const canvas = document.createElement('canvas');
	  const ctx = canvas.getContext('2d');
	  
	  img.onload = function() {
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
  
	  img.onerror = function() {
		console.warn(`Failed to load image: ${img.src}`);
	  };
  
	  if (img.complete) {
		img.onload();
	  }
	}
  
	// related-posts 構造の処理
	document.querySelectorAll('.related-post').forEach(post => {
	  const img = post.querySelector('.related-image');
	  const link = post.querySelector('.related-link');
	  if (img && link) {
		setBackgroundColorFromImage(img, link);
	  } else {
		console.warn('Image or link not found in related post:', post);
	  }
	});
  
	// articles-grid 構造の処理
	document.querySelectorAll('.article-item').forEach(item => {
	  const img = item.querySelector('.article-image');
	  const link = item.querySelector('.article-link');
	  if (img && link) {
		setBackgroundColorFromImage(img, link);
	  } else {
		console.warn('Image or link not found in article item:', item);
	  }
	});
  });