    <!-- 記事一覧 -->
    <div class="articles-grid">
    	<?php
		//キーワード検索
		$paged = (get_query_var('paged')) ? get_query_var('paged') : 1;
		$search_query = get_search_query();
		$args = array(
			'post_type' => 'post',
			'posts_per_page' => -1,
			'paged' => $paged
		);

		if (!empty($search_query)) {
			$args['s'] = $search_query;
		}

		//タグ検索
		$tag = get_queried_object();
		if (!empty($tag)) {

			$args['tax_query'] = array(
				array(
					'taxonomy' => 'post_tag',
					'field' => 'slug',
					'terms' => $tag->slug,
				),
			);
		}
		$query = new WP_Query($args);

		if ($query->have_posts()) :
			while ($query->have_posts()) : $query->the_post();

				// サムネイル画像のURLを取得
				$thumbnail_url = get_the_post_thumbnail_url(get_the_ID(), 'full');

				// サムネイル画像がない場合は、noimg.pngを使用
				if (!$thumbnail_url) {
					$thumbnail_url = get_template_directory_uri() . '/img/noimg.png';
				}
		?>
    			<div class="article-item">

    				<a href="<?php the_permalink(); ?>" class="article-link">
    					<img src="<?php echo $thumbnail_url; ?>" alt="<?php the_title(); ?>" class="article-image">
    					<div class="post_name">
    						<?php the_title(); ?>
    					</div>
    				</a>
    			</div>
    	<?php
			endwhile;
			wp_reset_postdata();
		else :
			echo '<p>記事がありません。</p>';
		endif;
		?>
    </div>