<!DOCTYPE html>
<html lang="ja">

<head>
	<!-- Google tag (gtag.js) -->
	<script async src="https://www.googletagmanager.com/gtag/js?id=G-D4DJ9TLVDW"></script>
	<script>
		window.dataLayer = window.dataLayer || [];

		function gtag() {
			dataLayer.push(arguments);
		}
		gtag('js', new Date());

		gtag('config', 'G-D4DJ9TLVDW');
	</script>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>偉人ノベル</title>
	<link rel="stylesheet" href="<?php echo get_theme_file_uri(); ?>/css/style.css">
	<link rel="manifest" href="<?php echo home_url(); ?>/wp/manifest.json">
	<link rel="icon" href="<?php echo get_theme_file_uri(); ?>/img/favicon/favicon.ico" sizes="any"><!-- 32×32 -->
	<link rel="icon" href="<?php echo get_theme_file_uri(); ?>/img/favicon/icon.svg" type="image/svg+xml">
	<link rel="apple-touch-icon" href="<?php echo get_theme_file_uri(); ?>/img/favicon/apple-touch-icon.png"><!-- 180×180 -->
	<link rel="manifest" href="<?php echo get_theme_file_uri(); ?>/img/favicon/manifest.webmanifest">
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Sawarabi+Gothic&display=swap" rel="stylesheet">
	<script src="https://kit.fontawesome.com/e382767a2e.js" crossorigin="anonymous"></script>
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
	<script src="<?php echo get_theme_file_uri(); ?>/js/book_cover.js"></script>
	<?php if (is_singular()) : ?>
		<script src="<?php echo get_theme_file_uri(); ?>/js/typing.js"></script>
	<?php endif; ?>
	<?php wp_head(); ?>
</head>

<body class="sawarabi">