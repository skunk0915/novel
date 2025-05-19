<?php get_template_part('parts/header'); ?>
<?php get_template_part('parts/site_header'); ?>
<div class="container_top">


    <!-- 検索フォーム -->
    <form role="search" method="get" id="searchform" action="<?php echo esc_url(home_url('/')); ?>">
        <input type="text" value="<?php echo get_search_query(); ?>" name="s" id="s" placeholder="（例）織田信長" />
        <input type="submit" id="searchsubmit" value="検索" />
    </form>

    <!-- タグフィルター -->
    <?php
    $tags = get_tags();
    if ($tags) :
        echo '<div class="tag-filter">';
        echo '<a href="' . home_url() . '">' . '全部' . '</a>';
        foreach ($tags as $tag) :
            echo '<a href="' . get_tag_link($tag->term_id) . '">' . $tag->name . '</a>';
        endforeach;
        echo '</div>';
    endif;
    ?>

    <!-- 記事一覧 -->
    <?php get_template_part('parts/article_list'); ?>

    <!-- ページネーション -->
    <?php
    // echo paginate_links(array(
    //     'total' => $query->max_num_pages
    // ));
    ?>
</div>
<!-- /.container_top -->

<?php get_template_part('parts/footer'); ?>