    <div class="sliders">
    	<div class="control-group">
    		<label for="speed-slider">
    			<i class="fa-solid fa-person-running" aria-hidden="true"></i>
    		</label>
    		<div class="slider-container">
    			<input type="range" class="speed-slider" min="1" max="100" value="50">
    			<span class="current-speed">現在の速度: 17ms</span>
    		</div>
    	</div>
    	<div class="control-group">
    		<label for="font-size-slider">
    			<i class="fa-solid fa-glasses" aria-hidden="true"></i>
    		</label>
    		<div class="slider-container">
    			<input type="range" class="font-size-slider" min="10" max="30" value="16">
    			<span class="current-font-size">現在の文字サイズ: 19px</span>
    		</div>
    	</div>
    	<div>
    		<i class="fa-solid fa-text-width"></i>
    		<input type="range" class="letter-spacing-slider" min="0" max="20" value="0">
    	</div>

		<div>
    		<i class="fa-solid fa-text-height"></i>
    		<input type="range" class="line-height-slider" min="10" max="40" value="15">
    	</div>

    </div>
    <div class="buttons">
    	<button class="mode-toggle">自動: OFF</button>
    	<button class="view-toggle">全文表示</button>
    </div>
    <div>
    	<button class="reset-button">しおりリセット</button>
    	<button class="dark-mode-toggle">ダークモード</button>
    	<span class="current-letter-spacing"></span>
    	<span class="current-line-height"></span>
    	<button class="speech-toggle">音声読み上げ</button>
    </div>