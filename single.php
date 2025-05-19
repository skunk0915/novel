<?php
$the_content = current_body();
?>
<?php get_template_part('parts/header'); ?>
<?php get_template_part('parts/site_header'); ?>

<div class="container">
	<div class="controls-set">
		<?php get_template_part('parts/controls'); ?>
	</div>


	<h1>
		<?php the_title(); ?>物語
	</h1>

	<?php if(!get_field('talk')): ?>
	<div class="article_img">
		<?php if (has_post_thumbnail()) : ?>
			<?php the_post_thumbnail('full', array('class' => 'article_img')); ?>
		<?php endif; ?>
	</div>
	<?php endif; ?>

	<?php if(get_field('talk')): ?>
	<div class="youtube_talk">
		<?php echo addRelParamToYouTubeEmbed(get_field('talk')) ?>
	</div>
	<?php endif; ?>
	<?php if(get_field('reading')): ?>
	<div class="youtube_reading">
        <span class="toggle-youtube" data-target="youtube_reading">読み聞かせ版</span>
        <div id="youtube_reading" style="display: none;">
            <?php echo addRelParamToYouTubeEmbed(get_field('reading')) ?>
        </div>
 	</div>
	<?php endif; ?>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const toggleButtons = document.querySelectorAll('.toggle-youtube');
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);
            if (targetElement.style.display === 'none') {
                targetElement.style.display = 'block';
            } else {
                targetElement.style.display = 'none';
            }
        });
    });
});
</script>

	<?php
	//タグ
	$post_tags = get_the_tags();
	if ($post_tags) :
		echo '<div class="post-tags">';
		foreach ($post_tags as $tag) :
			echo '<a href="' . get_tag_link($tag->term_id) . '">' . $tag->name . '</a>';
		endforeach;
		echo '</div>';
	endif;
	?>


	<?php if (get_field('event')): ?>
		<div class="event_title">年表</div>
		<div class="timeline-container">
			<div class="timeline">
				<?php
				echo convertEventToHtml(get_field('event'));
				?>
			</div>
		</div>
		<!-- /.event -->
	<?php endif; ?>

	<?php
	$switch_length = switch_length();
	if ($switch_length):
	?>
		<div class="switch_length_title">物語の長さ</div>
		<div class="switch_length">
			<?php
			echo $switch_length;
			?>
		</div>
	<?php endif; ?>


	<div class="story">
		<?php
		// the_content();
		echo $the_content;
		?>
	</div>
	<blockquote style="display: none;" class="without_head">
		<?php //echo get_content_without_headings($the_content);
		// the_content();
		?>
	</blockquote>

	<div id="story-container"></div>
</div>

<div class="toggle_target">
	<?php
	if ($post_tags) :
		foreach ($post_tags as $tag) :
			$args = array(
				'tag__in' => array($tag->term_id),
				'post__not_in' => array(get_the_ID()),
				'posts_per_page' => -1,
				'orderby' => 'rand'
			);
			$related_query = new WP_Query($args);
			if ($related_query->have_posts()) :
				echo '<h3>"' . $tag->name . '" の偉人ノベル</h3>';
				echo '<div class="related-posts">';
				while ($related_query->have_posts()) : $related_query->the_post();
					echo '<div class="related-post">';

					// サムネイル画像のURLを取得
					$thumbnail_url = get_the_post_thumbnail_url(get_the_ID(), 'full');

					// サムネイル画像がない場合は、noimg.pngを使用
					if (!$thumbnail_url) {
						$thumbnail_url = get_template_directory_uri() . '/img/noimg.png';
					}

					echo '<a href="' . get_permalink() . '" class="related-link">';
					echo '<img loading="lazy" src="' . esc_url($thumbnail_url) . '" alt="' . esc_attr(get_the_title()) . '" class="related-image" />';
					echo '<div class="post_name">' . esc_html(get_the_title()) . '</div>';
					echo '</a>';
					echo '</div>';
				endwhile;
				echo '</div>';
			endif;
			wp_reset_postdata();
		endforeach;
	endif;
	?>
</div>

<div class="loading">

	<div class="spinner-box">
		<div class="blue-orbit leo">
		</div>

		<div class="green-orbit leo">
		</div>

		<div class="red-orbit leo">
		</div>

		<div class="white-orbit w1 leo">
		</div>
		<div class="white-orbit w2 leo">
		</div>
		<div class="white-orbit w3 leo">
		</div>
	</div>
	読込中...

</div>

<?php get_template_part('parts/footer'); ?>