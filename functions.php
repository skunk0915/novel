<?php
ini_set('display_errors', 1);
add_theme_support('post-thumbnails');

//本文から見出し削除
function get_content_without_headings($content = null)
{
	if ($content === null) {
		$content = get_the_content();

		$content = apply_filters('the_content', $content);
		$content = str_replace(']]>', ']]&gt;', $content);

	}
	$content = apply_filters('the_content', $content);
	$content = preg_replace('/<h[1-6].*?>(.*?)<\/h[1-6]>/i', '', $content);
	$content = trim($content);

	return $content;
}


// 本文長さ切り替えボタンHTML
// コンテンツの文字数から読む時間を計算する関数
function calculate_reading_time($content)
{
	$char_count = mb_strlen(strip_tags($content));
	return ceil($char_count / 600);
}

// 本文長さ切り替えボタンHTMLパーツ
function generate_button($url, $minutes, $is_current = false)
{
	$class = '';
	if ($is_current) {
		$class .= 'current';
	}
	return sprintf(
		'<a href="%s" class="%s">%s分</a>',
		esc_url($url),
		esc_attr($class),
		esc_html($minutes)
	);
}

// 本文長さ切り替えボタンHTMLまとめ
function switch_length()
{
	$base_url = get_permalink();
	$current_length = isset($_GET['length']) ? sanitize_text_field($_GET['length']) : '';
	$buttons = [];

	// ACFフィールドのボタンを追加
	for ($i = 2; $i <= 5; $i++) {
		$field_name = "body_" . $i;
		$field_value = get_field($field_name);

		if ($field_value) {
			$minutes = calculate_reading_time($field_value);
			$button_url = add_query_arg('length', $field_name, $base_url);
			$is_current = ($current_length === $field_name);
			$buttons[] = [
				'minutes' => $minutes,
				'html' => generate_button($button_url, $minutes, $is_current)
			];
		}
	}

	// ACFフィールドのボタンが1つ以上ある場合のみ、メインコンテンツのボタンを追加
	if (!empty($buttons)) {
		$main_content = get_the_content();
		$main_content = apply_filters('the_content', $main_content);
		$main_content = str_replace(']]>', ']]&gt;', $main_content);

		$main_minutes = calculate_reading_time($main_content);
		$is_current_main = empty($current_length);
		array_unshift($buttons, [
			'minutes' => $main_minutes,
			'html' => generate_button($base_url, $main_minutes, $is_current_main)
		]);

		// 分数の少ない順に並べ替え
		usort($buttons, function ($a, $b) {
			return $a['minutes'] - $b['minutes'];
		});

		// ボタンのHTMLを結合
		return implode('', array_column($buttons, 'html'));
	}

	// ボタンがない場合は空文字列を返す
	return '';
}



// 現在の大中小モードに応じた本文
function current_body()
{
	$length_param = isset($_GET['length']) ? sanitize_text_field($_GET['length']) : '';
	$contents = '';

	$contents = get_field($length_param);
	if (empty($contents)) {
		$contents = get_the_content();

		$contents = apply_filters('the_content', $contents);
		$contents = str_replace(']]>', ']]&gt;', $contents);
	}

	return $contents;
}

// ショートコードを登録
function acf_content_shortcode()
{
	$contents = get_acf_content();
	return '<div class="acf-content">' . wp_kses_post($contents) . '</div>';
}
add_shortcode('acf_content', 'acf_content_shortcode');


// 年表作成
function convertEventToHtml($event)
{
	$lines = explode("\n", trim($event));
	$events = [];

	foreach ($lines as $line) {
		list($year, $age, $content) = explode(',', $line, 3);
		$events[] = [
			'year' => (int)$year,
			'age' => (int)$age,
			'content' => trim($content)
		];
	}

	$minAge = $events[0]['age'];
	$maxAge = end($events)['age'];
	$ageRange = $maxAge - $minAge;

	$html = '';
	foreach ($events as $index => $event) {
		$left = ($event['age'] - $minAge) / $ageRange * 100;
		$left = min(100, max(0, $left)); // Ensure left is between 0 and 100

		$html .= sprintf(
			'<div class="event" style="left: %.2f%%;">
                <div class="event-date">%d年</div>
                <div class="event-age">%d才</div>
                <div class="event-content">%s</div>
            </div>',
			$left,
			$event['year'],
			$event['age'],
			htmlspecialchars($event['content'])
		);
	}

	return $html;
}

// 生没年一括登録
function update_acf_fields_from_csv()
{
	$csv_file = get_template_directory() . '/birth.csv';

	if (!file_exists($csv_file)) {
		error_log('CSV file not found: ' . $csv_file);
		return;
	}

	$file = fopen($csv_file, 'r');

	while (($data = fgetcsv($file)) !== FALSE) {
		if (count($data) === 3) {
			$title = $data[0];
			$birth_year = $data[1];
			$death_year = $data[2];

			$posts = get_posts(array(
				'post_type' => 'post',
				'post_status' => 'publish',
				'title' => $title,
				'posts_per_page' => 1
			));

			if (!empty($posts)) {
				$post_id = $posts[0]->ID;
				update_field('birth_year', $birth_year, $post_id);
				update_field('death_year', $death_year, $post_id);
				error_log("Updated post: $title (ID: $post_id)");
			} else {
				error_log("Post not found: $title");
			}
		}
	}

	fclose($file);
}

// 管理画面アクセス時に即実行。実行させるときのみ有効化
// add_action('admin_init', 'update_acf_fields_from_csv');


// 記事並び替え
// ソートオプションを表示するための関数
function display_sort_options()
{
	$current_sort = isset($_GET['sort']) ? $_GET['sort'] : '';
	$options = array(
		'' => '並べ替え',
		'birth_year_asc' => '古い順',
		'birth_year_desc' => '新しい順',
		'lifespan_asc' => '短命',
		'lifespan_desc' => '長生き',
	);

	echo '<select id="sort-options" onchange="window.location.href=this.value;">';
	foreach ($options as $value => $label) {
		$selected = ($current_sort === $value) ? 'selected' : '';
		$url = add_query_arg('sort', $value);
		echo "<option value='{$url}' {$selected}>{$label}</option>";
	}
	echo '</select>';
}

// 寿命を計算し、デバッグ情報を表示する関数
function calculate_and_display_lifespan($post_id) {
    $post_title = get_the_title($post_id);
    $birth_year = get_field('birth_year', $post_id);
    $death_year = get_field('death_year', $post_id);
    $current_year = date('Y');
    
    if ($birth_year && $death_year) {
        $lifespan = $death_year - $birth_year;
        echo "記事: \"$post_title\", 誕生年: $birth_year, 死亡年: $death_year, 寿命: $lifespan 年<br>";
        return $lifespan;
    } elseif ($birth_year) {
        $current_age = $current_year - $birth_year;
        echo "記事: \"$post_title\", 誕生年: $birth_year, 生存中, 現在の年齢: $current_age 年<br>";
        return $current_age;
    } else {
        echo "記事: \"$post_title\", 誕生年が設定されていません<br>";
        return 0;
    }
}

// 寿命でソートするためのカスタムクエリを修正
function add_lifespan_orderby($orderby, $query) {
    if ($query->get('orderby') === 'lifespan') {
        global $wpdb;
        $current_year = date('Y');
        $orderby = "CASE
            WHEN death.meta_value IS NOT NULL AND death.meta_value != '' THEN (CAST(death.meta_value AS SIGNED) - CAST(birth.meta_value AS SIGNED))
            WHEN birth.meta_value IS NOT NULL AND birth.meta_value != '' THEN ($current_year - CAST(birth.meta_value AS SIGNED))
            ELSE 0
        END " . $query->get('order');
        
        // デバッグ用：SQL クエリを出力
        error_log("Lifespan Order By SQL: " . $orderby);
    }
    return $orderby;
}
add_filter('posts_orderby', 'add_lifespan_orderby', 10, 2);

// 寿命でソートする際のJOINを修正
function add_lifespan_join($join, $query) {
    if ($query->get('orderby') === 'lifespan') {
        global $wpdb;
        $join .= " LEFT JOIN {$wpdb->postmeta} AS birth ON ({$wpdb->posts}.ID = birth.post_id AND birth.meta_key = 'birth_year')";
        $join .= " LEFT JOIN {$wpdb->postmeta} AS death ON ({$wpdb->posts}.ID = death.post_id AND death.meta_key = 'death_year')";
        
        // デバッグ用：SQL JOINを出力
        error_log("Lifespan Join SQL: " . $join);
    }
    return $join;
}
add_filter('posts_join', 'add_lifespan_join', 10, 2);

// SQL クエリをデバッグするための関数
function debug_query($query) {
    if ($query->get('orderby') === 'lifespan') {
        error_log("Full SQL Query: " . $query->request);
    }
}
add_action('pre_get_posts', 'debug_query', 9999);


// youtube埋め込みURLにrel=0を追加
function addRelParamToYouTubeEmbed($html) {
    // DOMDocumentを使用してHTMLを解析
    $dom = new DOMDocument();
    libxml_use_internal_errors(true); // HTML5タグによるエラーを抑制
    $dom->loadHTML($html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    libxml_clear_errors();

    // iframeタグを検索
    $iframes = $dom->getElementsByTagName('iframe');
    
    foreach ($iframes as $iframe) {
        if ($iframe->hasAttribute('src')) {
            $src = $iframe->getAttribute('src');
            
            // URLにすでにパラメータが含まれているかチェック
            if (strpos($src, '?') !== false) {
                // すでにパラメータがある場合は&rel=0を追加
                $src .= '&rel=0';
            } else {
                // パラメータがない場合は?rel=0を追加
                $src .= '?rel=0';
            }
            
            $iframe->setAttribute('src', $src);
        }
    }

    // 修正したHTMLを返す
    return $dom->saveHTML();
}




// アプリ化
// function add_pwa_meta_tags() {
//     echo '<link rel="manifest" href="/manifest.json">';
//     echo '<meta name="theme-color" content="#000000">';
//     echo '<link rel="apple-touch-icon" href="/wp-content/uploads/pwa-icon-192x192.png">';
//     echo '<meta name="apple-mobile-web-app-capable" content="yes">';
//     echo '<meta name="apple-mobile-web-app-status-bar-style" content="default">';
//     echo '<meta name="apple-mobile-web-app-title" content="My WordPress PWA">';
// }
// add_action('wp_head', 'add_pwa_meta_tags');

// function register_service_worker()
// {
// 	echo '<script>
//     if ("serviceWorker" in navigator) {
//       window.addEventListener("load", function() {
//         navigator.serviceWorker.register("/wp/sw.js").then(
//           function(registration) {
//             console.log("Service Worker registration successful with scope: ", registration.scope);
//           },
//           function(err) {
//             console.log("Service Worker registration failed: ", err);
//           }
//         );
//       });
//     }
//     </script>';
// }
// add_action('wp_footer', 'register_service_worker');

// // 不要なブロックを非表示にする
// function custom_allowed_block_types_all( $allowed_block_types, $block_editor_context ) {
// 	$allowed_block_types = array(
// 	//   'core/paragraph', // 段落
// 	//   'core/heading', // 見出し
// 	//   'core/list', // リスト
// 	//   'core/list-item', // リスト項目
// 	//   'core/embed', // 埋め込み
// 	'imgur'
// 	);
// 	return $allowed_block_types;
//   }
//   add_filter( 'allowed_block_types_all', 'custom_allowed_block_types_all', 10, 2 );
//   // JavaScript の読み込み
//   function my_admin_enqueue_scripts() {
// 	wp_enqueue_script('my_admin_script', get_template_directory_uri() . '/js/wp_editor.js', '', '', true);
//   }
//   add_action('admin_enqueue_scripts', 'my_admin_enqueue_scripts');
  