// 不要な埋め込みブロックを非表示にする
wp.domReady(() => {
	const registerEmbedBlocks = [
	//   'twitter',
	//   'youtube',
	'imgur'
	];
	wp.blocks.getBlockVariations( 'core/embed' ).forEach( block => {
	  if ( ! registerEmbedBlocks.includes( block.name ) ) {
		wp.blocks.unregisterBlockVariation( 'core/embed', block.name );
	  }
	});
  });
  