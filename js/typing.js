window.addEventListener('load', function () {
    function createProgressDiv() {
        const div = document.createElement('div');
        div.className = 'progress';
        document.getElementById('story-container').parentNode.insertBefore(div, document.getElementById('story-container'));
        return div;
    }

    function createStatsDiv() {
        const div = document.createElement('div');
        div.className = 'stats';
        document.getElementById('story-container').parentNode.insertBefore(div, document.getElementById('story-container'));
        return div;
    }

    const elements = {
        loading: document.querySelector('.loading'),
        controlSets: document.querySelectorAll('.controls-set'),
        // originalStory: document.querySelector('.without_head'),
        originalStory: document.querySelector('.story'),
        fullStory: document.querySelector('.story'),
        storyContainer: document.getElementById('story-container'),
        toggleTarget: document.querySelector('.toggle_target'),
        subMenuButton: document.querySelector('.sub_menu'),
        slideMenu: document.querySelector('.slide_menu'),
        closeMenuButton: document.querySelector('.close_menu'),
        progressDiv: document.querySelector('.progress') || createProgressDiv(),
        statsDiv: document.querySelector('.stats') || createStatsDiv()
    };

    if (elements.loading) {
        elements.loading.classList.add('fade-out');
        elements.loading.addEventListener('transitionend', function () {
            elements.loading.classList.add('hidden');
        });
    }

    const pageId = window.location.pathname;
    let state = {
        currentIndex: 0,
        periodCount: 0,
        isPlaying: true,
        typingSpeed: 55,
        fontSize: 16,
        letterSpacing: 0,
        lineHeight: 2,
        isPauseMode: true,
        isInQuote: false,
        isInParentheses: false,
        isAutoScrolling: false,
        isTypingView: loadFromLocalStorage('isTypingView', true),
        lastScrollPosition: window.pageYOffset,
        forceScroll: true,
        startTime: null,
        lastRemainingChars: null,
        lastChangeTime: null,
        isCalculationPaused: false,
        totalElapsedTime: 0,
        lastPauseTime: null,
        lastUpdateTime: null,
        isDarkMode: loadFromLocalStorage('isDarkMode', false)
    };

    let autoScrollInterval;
    let updateStatsInterval;
    let elapsedTimeInterval;
    let speechSynthesis = window.speechSynthesis;
    let speechUtterance = null;

    const typingStoppedMessage = createTypingStoppedMessage();

    function createTypingStoppedMessage() {
        const div = document.createElement('div');
        div.className = 'typing-stopped-message';
        div.textContent = '自動タイピング停止';
        document.body.appendChild(div);
        return div;
    }

    function loadFromLocalStorage(key, defaultValue, isPageSpecific = false) {
        const storageKey = isPageSpecific ? `${pageId}_${key}` : `global_${key}`;
        const value = localStorage.getItem(storageKey);
        return value !== null ? JSON.parse(value) : defaultValue;
    }

    function saveToLocalStorage(key, value, isPageSpecific = false) {
        const storageKey = isPageSpecific ? `${pageId}_${key}` : `global_${key}`;
        localStorage.setItem(storageKey, JSON.stringify(value));
    }

    function speedToTypingSpeed(speed) {
        return Math.max(3, Math.round(100 - (speed - 1) * 0.97));
    }

    function typingSpeedToSpeed(typingSpeed) {
        return Math.min(100, Math.max(1, Math.round((100 - typingSpeed) / 0.97 + 1)));
    }

    function updateModeToggle() {
        elements.controlSets.forEach(controlSet => {
            const modeToggle = controlSet.querySelector('.mode-toggle');
            if (modeToggle) {
                modeToggle.textContent = `自動: ${state.isPauseMode ? 'OFF' : 'ON'}`;
            }
        });
        if (!state.isPauseMode) {
            startAutoScroll();
        } else {
            stopAutoScroll();
            showTypingStoppedMessage();
        }
    }

    function showTypingStoppedMessage() {
        if (state.isTypingView) {
            typingStoppedMessage.style.opacity = '1';
            typingStoppedMessage.style.display = 'block';
            setTimeout(() => {
                typingStoppedMessage.style.opacity = '0';
                setTimeout(() => {
                    typingStoppedMessage.style.display = 'none';
                }, 500);
            }, 500);
        }
    }

    function updateCurrentSpeedDisplay() {
        elements.controlSets.forEach(controlSet => {
            const currentSpeedDisplay = controlSet.querySelector('.current-speed');
            if (currentSpeedDisplay) {
                currentSpeedDisplay.textContent = `現在の速度: ${state.typingSpeed}ms (最高速: 3ms)`;
            }
        });
    }

    function updateCurrentFontSizeDisplay() {
        elements.controlSets.forEach(controlSet => {
            const currentFontSizeDisplay = controlSet.querySelector('.current-font-size');
            if (currentFontSizeDisplay) {
                currentFontSizeDisplay.textContent = `現在の文字サイズ: ${state.fontSize}px`;
            }
        });
    }

    function updateCurrentLetterSpacingDisplay() {
        elements.controlSets.forEach(controlSet => {
            const currentLetterSpacingDisplay = controlSet.querySelector('.current-letter-spacing');
            if (currentLetterSpacingDisplay) {
                currentLetterSpacingDisplay.textContent = `現在の文字間隔: ${state.letterSpacing / 10}em`;
            }
        });
    }

    function updateCurrentLineHeightDisplay() {
        elements.controlSets.forEach(controlSet => {
            const currentLineHeightDisplay = controlSet.querySelector('.current-line-height');
            if (currentLineHeightDisplay) {
                currentLineHeightDisplay.textContent = `現在の行間: ${state.lineHeight}em`;
            }
        });
    }

    function setTypingSpeed(speed) {
        state.typingSpeed = speedToTypingSpeed(speed);
        saveToLocalStorage('typingSpeed', state.typingSpeed);
        updateCurrentSpeedDisplay();
        elements.controlSets.forEach(controlSet => {
            const speedSlider = controlSet.querySelector('.speed-slider');
            if (speedSlider) {
                speedSlider.value = speed;
            }
        });
    }

    function setFontSize(size) {
        state.fontSize = size;
        elements.originalStory.style.fontSize = `${state.fontSize}px`;
        elements.fullStory.style.fontSize = `${state.fontSize}px`;
        elements.storyContainer.style.fontSize = `${state.fontSize}px`;
        saveToLocalStorage('fontSize', state.fontSize);
        updateCurrentFontSizeDisplay();
        elements.controlSets.forEach(controlSet => {
            const fontSizeSlider = controlSet.querySelector('.font-size-slider');
            if (fontSizeSlider) {
                fontSizeSlider.value = size;
            }
        });
    }

    function setLetterSpacing(spacing) {
        state.letterSpacing = Math.min(spacing, 10);
        elements.originalStory.style.letterSpacing = `${state.letterSpacing / 10}em`;
        elements.fullStory.style.letterSpacing = `${state.letterSpacing / 10}em`;
        elements.storyContainer.style.letterSpacing = `${state.letterSpacing / 10}em`;
        saveToLocalStorage('letterSpacing', state.letterSpacing);
        updateCurrentLetterSpacingDisplay();
        elements.controlSets.forEach(controlSet => {
            const letterSpacingSlider = controlSet.querySelector('.letter-spacing-slider');
            if (letterSpacingSlider) {
                letterSpacingSlider.value = state.letterSpacing;
            }
        });
    }

    function setLineHeight(height) {
        state.lineHeight = height / 10;
        elements.originalStory.style.lineHeight = `${state.lineHeight}em`;
        elements.fullStory.style.lineHeight = `${state.lineHeight}em`;
        elements.storyContainer.style.lineHeight = `${state.lineHeight}em`;
        saveToLocalStorage('lineHeight', state.lineHeight);
        updateCurrentLineHeightDisplay();
        elements.controlSets.forEach(controlSet => {
            const lineHeightSlider = controlSet.querySelector('.line-height-slider');
            if (lineHeightSlider) {
                lineHeightSlider.value = height;
            }
        });
    }


    function sanitizeHTML(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const allowedTags = ['h2','p', 'br', 'b', 'i', 'u', 'strong', 'em', 'span', 'a', 'figure','iframe','div', 'img'];
        const allowedAttributes = ['class', 'src', 'alt', 'href'];
    
        function sanitizeNode(node) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                if (!allowedTags.includes(node.tagName.toLowerCase())) {
                    return document.createTextNode(node.textContent);
                }
                const newElement = document.createElement(node.tagName);
                for (let attr of node.attributes) {
                    if (allowedAttributes.includes(attr.name)) {
                        newElement.setAttribute(attr.name, attr.value);
                    }
                }
                for (let child of node.childNodes) {
                    newElement.appendChild(sanitizeNode(child));
                }
                return newElement;
            }
            return node.cloneNode();
        }
    
        return Array.from(doc.body.childNodes).map(sanitizeNode);
    }
    


    function toggleView() {
        state.isTypingView = !state.isTypingView;
        updateView();
        saveToLocalStorage('isTypingView', state.isTypingView);
    }

    function updateView() {
        if (state.isTypingView) {
            saveFullTextScrollPosition();
            elements.fullStory.style.display = 'none';
            elements.storyContainer.style.display = 'block';
            elements.controlSets.forEach(controlSet => {
                const viewToggle = controlSet.querySelector('.view-toggle');
                if (viewToggle) {
                    viewToggle.textContent = '全文表示';
                }
            });
            if (!state.isPlaying && state.currentIndex === 0) {
                state.isPlaying = true;
                startTyping();
            }
            state.forceScroll = true;
            elements.toggleTarget.style.display = 'none';
            elements.progressDiv.style.display = 'block';
            elements.statsDiv.style.display = 'block';
            scrollToBottomImmediately();
        } else {
            elements.fullStory.style.display = 'block';
            elements.storyContainer.style.display = 'none';
            elements.controlSets.forEach(controlSet => {
                const viewToggle = controlSet.querySelector('.view-toggle');
                if (viewToggle) {
                    viewToggle.textContent = 'タイピング表示';
                }
            });
            state.forceScroll = false;
            elements.toggleTarget.style.display = 'block';
            elements.progressDiv.style.display = 'none';
            elements.statsDiv.style.display = 'none';
            stopUpdateStats();
            stopUpdateElapsedTime();
            restoreFullTextScrollPosition();

            // 全文表示モードでは「自動タイピング停止」メッセージを表示しない
            if (typingStoppedMessage) {
                typingStoppedMessage.style.display = 'none';
            }
        }
    }

    function saveFullTextScrollPosition() {
        const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        saveToLocalStorage('fullTextScrollPosition', scrollPosition, true);
    }

    function restoreFullTextScrollPosition() {
        const savedScrollPosition = loadFromLocalStorage('fullTextScrollPosition', 0, true);
        window.scrollTo(0, savedScrollPosition);
    }

    function startTyping() {
        state.startTime = new Date();
        state.lastUpdateTime = state.startTime;
        state.lastPauseTime = null;
        state.totalElapsedTime = loadFromLocalStorage('totalElapsedTime', 0, true);
        displayNextChar();
        startUpdateStats();
        startUpdateElapsedTime();
    }

    function createNodeIterator(content) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        return document.createNodeIterator(doc.body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    }
    function displayNextChar() {
        if (state.isPlaying && state.currentIndex < elements.originalStory.innerHTML.length) {
            const nextChar = elements.originalStory.innerHTML[state.currentIndex];
            let displayContent = nextChar;
    
            if (nextChar === '<') {
                const tagEnd = elements.originalStory.innerHTML.indexOf('>', state.currentIndex);
                if (tagEnd !== -1) {
                    displayContent = elements.originalStory.innerHTML.slice(state.currentIndex, tagEnd + 1);
                    state.currentIndex = tagEnd;
                }
            }
    
            const sanitizedContent = sanitizeHTML(displayContent);
            sanitizedContent.forEach(node => elements.storyContainer.appendChild(node));
            state.currentIndex++;
    
            if (nextChar === "。" && !state.isInQuote && !state.isInParentheses) {
                state.periodCount++;
                if (state.isPauseMode && state.periodCount >= 3) {
                    pauseTyping();
                    return; // ここで関数を終了
                }
            }
    
            updateProgress();
            saveReadingPosition();
    
            if (state.isPlaying) {
                setTimeout(displayNextChar, state.typingSpeed);
            }
        } else if (state.currentIndex >= elements.originalStory.innerHTML.length) {
            stopAutoScroll();
            elements.toggleTarget.style.display = 'block';
            stopUpdateStats();
            stopUpdateElapsedTime();
            updateElapsedTime();
            setTimeout(scrollToRelatedPosts, 1000);
        }
    }
    
    function pauseTyping() {
        state.isPlaying = false;
        state.lastPauseTime = new Date();
        stopUpdateElapsedTime();
        if (state.currentIndex < elements.originalStory.innerHTML.length) {
            elements.storyContainer.innerHTML += '<span class="blink-arrow" tabindex="0" role="button" aria-label="続きを表示">▼</span>';
            const blinkArrow = elements.storyContainer.querySelector('.blink-arrow');
            blinkArrow.addEventListener('click', handleContinue);
            blinkArrow.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    handleContinue();
                }
            });
        }
    }
    
    

    function scrollToRelatedPosts() {
        const relatedPosts = document.querySelector('.related-posts');
        if (relatedPosts) {
            const windowHeight = window.innerHeight;
            const relatedPostsRect = relatedPosts.getBoundingClientRect();
            const scrollTo = window.pageYOffset + relatedPostsRect.top + relatedPostsRect.height - windowHeight;

            window.scrollTo({
                top: scrollTo,
                behavior: 'smooth'
            });
        }
    }

    function handleContinue() {
        if (state.currentIndex < elements.originalStory.innerHTML.length) {
            state.isPlaying = true;
            state.periodCount = 0;
            if (state.isPauseMode) {
                scrollToBottom(true);
            } else {
                scrollToBottomImmediately();
            }
            if (state.lastPauseTime) {
                state.totalElapsedTime += new Date() - state.lastPauseTime;
                state.lastPauseTime = null;
            }
            state.lastUpdateTime = new Date();
            startUpdateElapsedTime();
            const blinkArrow = elements.storyContainer.querySelector('.blink-arrow');
            if (blinkArrow) {
                blinkArrow.remove();
            }
            displayNextChar();
            if (!state.isPauseMode) {
                startAutoScroll();
            }
        }
    }
    
    

    function startAutoScroll() {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
        }
        scrollToBottom();
        autoScrollInterval = setInterval(() => {
            if (state.isPlaying && state.forceScroll) {
                scrollToBottom();
            }
        }, 1000);
    }

    function stopAutoScroll() {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
        }
    }

    function scrollToBottom(force = false) {
        const scrollHeight = Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        );
        const currentScroll = window.pageYOffset + window.innerHeight;
        if ((force || scrollHeight - currentScroll > 10) && state.forceScroll) {
            state.isAutoScrolling = true;
            window.scrollTo({
                top: scrollHeight,
                behavior: 'smooth'
            });
            setTimeout(() => {
                state.isAutoScrolling = false;
            }, 500);
        }
    }

    function scrollToBottomImmediately() {
        const scrollHeight = Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        );
        window.scrollTo(0, scrollHeight);
    }

    function updateProgress() {
        const totalChars = elements.originalStory.innerHTML.length;
        const progress = (state.currentIndex / totalChars) * 100;
        elements.progressDiv.style.width = `${progress}%`;
    }
        
    function updateElapsedTime() {
        const now = new Date();
        if (state.isPlaying) {
            state.totalElapsedTime += now - state.lastUpdateTime;
        }
        state.lastUpdateTime = now;

        const elapsedSeconds = Math.floor(state.totalElapsedTime / 1000);
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;
        elements.statsDiv.innerHTML = `経過時間: ${minutes}分${seconds}秒<br>` + elements.statsDiv.innerHTML.split('<br>').slice(1).join('<br>');

        saveToLocalStorage('totalElapsedTime', state.totalElapsedTime, true);
    }

    function startUpdateElapsedTime() {
        if (elapsedTimeInterval) {
            clearInterval(elapsedTimeInterval);
        }
        elapsedTimeInterval = setInterval(updateElapsedTime, 1000);
        updateElapsedTime();
    }

    function stopUpdateElapsedTime() {
        if (elapsedTimeInterval) {
            clearInterval(elapsedTimeInterval);
        }
    }

    function updateStats() {
        const totalChars = elements.originalStory.innerHTML.length;
        const readChars = state.currentIndex;
        const remainingChars = totalChars - readChars;
    
        if (remainingChars !== state.lastRemainingChars) {
            state.lastRemainingChars = remainingChars;
            state.lastChangeTime = new Date();
            state.isCalculationPaused = false;
        } else if (new Date() - state.lastChangeTime > 10000) {
            state.isCalculationPaused = true;
        }
    
        let estimatedTimeRemaining = '計算中...';
        if (!state.isCalculationPaused && state.totalElapsedTime > 0) {
            const charsPerSecond = readChars / (state.totalElapsedTime / 1000);
            estimatedTimeRemaining = formatTime(remainingChars / charsPerSecond);
        }
    
        elements.statsDiv.innerHTML = `
            経過時間: ${formatTime(state.totalElapsedTime / 1000)}<br>
            読んだ文字数: ${readChars}<br>
            残り文字数: ${remainingChars}<br>
            完了まであと約: ${estimatedTimeRemaining}
        `;
    }
    
    

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}分${remainingSeconds}秒`;
    }

    function startUpdateStats() {
        updateStatsInterval = setInterval(updateStats, 1000);
        updateStats();
    }

    function stopUpdateStats() {
        clearInterval(updateStatsInterval);
    }

    function saveReadingPosition() {
        saveToLocalStorage('currentIndex', state.currentIndex, true);
    }

    function loadReadingPosition() {
        return loadFromLocalStorage('currentIndex', 0, true);
    }

    function resetCurrentPageMemory() {
        state.currentIndex = 0;
        state.periodCount = 0;
        state.isPlaying = true;
        elements.storyContainer.innerHTML = '';
        saveToLocalStorage('currentIndex', state.currentIndex, true);
        saveToLocalStorage('totalElapsedTime', 0, true);
        state.totalElapsedTime = 0;
        updateProgress();
        displayNextChar();
    }

    function toggleDarkMode() {
        state.isDarkMode = !state.isDarkMode;
        document.body.classList.toggle('dark-mode', state.isDarkMode);
        saveToLocalStorage('isDarkMode', state.isDarkMode);
        updateDarkModeElements();
    }

    function updateDarkModeElements() {
        const header = document.querySelector('.site_header');
        const toTopButton = document.querySelector('.to_top .fa-circle-chevron-up');
        const timelineContainer = document.querySelector('.timeline-container');

        if (state.isDarkMode) {
            if (header) {
                const logoImg = header.querySelector('img');
                if (logoImg) {
                    logoImg.src = 'https://novel.flow-t.net/wp/wp-content/themes/novel/img/logo_white.svg';
                }
            }
            if (toTopButton) {
                toTopButton.style.color = '#fff';
            }
            elements.controlSets.forEach(controlSet => {
                controlSet.style.backgroundColor = '#333';
            });
            if (timelineContainer) {
                timelineContainer.style.borderTop = '1px solid #000000';
                timelineContainer.style.borderBottom = '1px solid #676767';
                timelineContainer.style.background = '#333';
            }
            if (elements.slideMenu) {
                elements.slideMenu.style.setProperty('--slide-menu-open-color', '#000');
            }
        } else {
            if (header) {
                const logoImg = header.querySelector('img');
                if (logoImg) {
                    logoImg.src = 'https://novel.flow-t.net/wp/wp-content/themes/novel/img/logo.svg';
                }
            }
            if (toTopButton) {
                toTopButton.style.color = '';
            }
            elements.controlSets.forEach(controlSet => {
                controlSet.style.backgroundColor = '';
            });
            if (timelineContainer) {
                timelineContainer.style.borderTop = '';
                timelineContainer.style.borderBottom = '';
                timelineContainer.style.background = '';
            }
            if (elements.slideMenu) {
                elements.slideMenu.style.setProperty('--slide-menu-open-color', '');
            }
        }
    }

    function toggleSpeech() {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
            elements.controlSets.forEach(controlSet => {
                const speechToggle = controlSet.querySelector('.speech-toggle');
                if (speechToggle) {
                    speechToggle.textContent = '音声読み上げ';
                }
            });
        } else {
            const remainingText = elements.originalStory.textContent.slice(state.currentIndex);
            speechUtterance = new SpeechSynthesisUtterance(remainingText);
            speechUtterance.lang = 'ja-JP';
            speechSynthesis.speak(speechUtterance);
            elements.controlSets.forEach(controlSet => {
                const speechToggle = controlSet.querySelector('.speech-toggle');
                if (speechToggle) {
                    speechToggle.textContent = '読み上げ停止';
                }
            });
        }
    }

    window.addEventListener('scroll', () => {
        if (!state.isAutoScrolling) {
            const currentScrollPosition = window.pageYOffset;
            if (currentScrollPosition < state.lastScrollPosition && !state.isPauseMode) {
                state.isPauseMode = true;
                updateModeToggle();
            }
            state.lastScrollPosition = currentScrollPosition;
            if (!state.isTypingView) {
                saveFullTextScrollPosition();
            }
        }
    });

    elements.storyContainer.addEventListener('click', function(event) {
        if (!state.isPlaying || (state.isPauseMode && state.periodCount >= 3)) {
            handleContinue();
        }
    });

    let isAdjusting = false;
    let adjustmentTimer;

    function startAdjustment() {
        if (!isAdjusting) {
            isAdjusting = true;
            elements.slideMenu.style.backdropFilter = 'blur(0px)';
        }
        clearTimeout(adjustmentTimer);
    }

    function endAdjustment() {
        adjustmentTimer = setTimeout(() => {
            isAdjusting = false;
            elements.slideMenu.style.backdropFilter = 'blur(4px)';
        }, 300);
    }

    elements.controlSets.forEach(controlSet => {
        const modeToggle = controlSet.querySelector('.mode-toggle');
        const viewToggle = controlSet.querySelector('.view-toggle');
        const speedSlider = controlSet.querySelector('.speed-slider');
        const fontSizeSlider = controlSet.querySelector('.font-size-slider');
        const letterSpacingSlider = controlSet.querySelector('.letter-spacing-slider');
        const lineHeightSlider = controlSet.querySelector('.line-height-slider');
        const resetButton = controlSet.querySelector('.reset-button');
        const darkModeToggle = controlSet.querySelector('.dark-mode-toggle');
        const speechToggle = controlSet.querySelector('.speech-toggle');

        if (modeToggle) {
            modeToggle.addEventListener('click', function (event) {
                state.isPauseMode = !state.isPauseMode;
                updateModeToggle();
                saveToLocalStorage('isPauseMode', state.isPauseMode);
                if (!state.isPauseMode) {
                    scrollToBottomImmediately();
                    if (!state.isPlaying) {
                        handleContinue();
                    }
                }
            });
        }

        if (viewToggle) {
            viewToggle.addEventListener('click', toggleView);
        }

        if (speedSlider) {
            speedSlider.addEventListener('mousedown', startAdjustment);
            speedSlider.addEventListener('touchstart', startAdjustment);
            speedSlider.addEventListener('input', function () {
                let speed = parseInt(this.value);
                setTypingSpeed(speed);
            });
            speedSlider.addEventListener('mouseup', endAdjustment);
            speedSlider.addEventListener('touchend', endAdjustment);
        }

        if (fontSizeSlider) {
            fontSizeSlider.addEventListener('mousedown', startAdjustment);
            fontSizeSlider.addEventListener('touchstart', startAdjustment);
            fontSizeSlider.addEventListener('input', function () {
                let size = parseInt(this.value);
                setFontSize(size);
            });
            fontSizeSlider.addEventListener('mouseup', endAdjustment);
            fontSizeSlider.addEventListener('touchend', endAdjustment);
        }

        if (letterSpacingSlider) {
            letterSpacingSlider.addEventListener('mousedown', startAdjustment);
            letterSpacingSlider.addEventListener('touchstart', startAdjustment);
            letterSpacingSlider.addEventListener('input', function () {
                let spacing = parseInt(this.value);
                setLetterSpacing(spacing);
            });
            letterSpacingSlider.addEventListener('mouseup', endAdjustment);
            letterSpacingSlider.addEventListener('touchend', endAdjustment);
            letterSpacingSlider.max = "10";
        }

        if (lineHeightSlider) {
            lineHeightSlider.addEventListener('mousedown', startAdjustment);
            lineHeightSlider.addEventListener('touchstart', startAdjustment);
            lineHeightSlider.addEventListener('input', function () {
                let height = parseInt(this.value);
                setLineHeight(height);
            });
            lineHeightSlider.addEventListener('mouseup', endAdjustment);
            lineHeightSlider.addEventListener('touchend', endAdjustment);
        }

        if (resetButton) {
            resetButton.addEventListener('click', resetCurrentPageMemory);
        }

        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', toggleDarkMode);
        }

        if (speechToggle) {
            speechToggle.addEventListener('click', toggleSpeech);
        }
    });

    if (elements.subMenuButton && elements.slideMenu) {
        elements.subMenuButton.addEventListener('click', () => {
            elements.slideMenu.classList.toggle('open');
        });
    }

    if (elements.closeMenuButton) {
        elements.closeMenuButton.addEventListener('click', () => {
            elements.slideMenu.classList.remove('open');
        });
    }

    document.addEventListener('click', (event) => {
        if (elements.slideMenu && !elements.slideMenu.contains(event.target) && elements.subMenuButton && !elements.subMenuButton.contains(event.target)) {
            elements.slideMenu.classList.remove('open');
        }
    });

    window.addEventListener('beforeunload', () => {
        saveReadingPosition();
        saveToLocalStorage('totalElapsedTime', state.totalElapsedTime, true);
        saveToLocalStorage('isTypingView', state.isTypingView);
        if (!state.isTypingView) {
            saveFullTextScrollPosition();
        }
    });

    // 初期化
    state.typingSpeed = loadFromLocalStorage('typingSpeed', 55);
    state.fontSize = loadFromLocalStorage('fontSize', 16);
    state.letterSpacing = loadFromLocalStorage('letterSpacing', 0);
    state.letterSpacing = Math.min(state.letterSpacing, 10);
    state.lineHeight = loadFromLocalStorage('lineHeight', 2);
    state.isPauseMode = loadFromLocalStorage('isPauseMode', true);
    updateModeToggle();
    setTypingSpeed(typingSpeedToSpeed(state.typingSpeed));
    setFontSize(state.fontSize);
    setLetterSpacing(state.letterSpacing);
    setLineHeight(state.lineHeight * 10);
    document.body.classList.toggle('dark-mode', state.isDarkMode);
    updateDarkModeElements();

    updateView();

    // 保存された位置から読み始める
    state.currentIndex = loadReadingPosition();
if (state.currentIndex > 0 && state.isTypingView) {
    const savedContent = elements.originalStory.innerHTML.slice(0, state.currentIndex);
    elements.storyContainer.innerHTML = sanitizeHTML(savedContent).map(node => node.outerHTML).join('');
    // タイピング表示で前回の続きを表示するときは最下部へスクロール
    setTimeout(() => {
        scrollToBottomImmediately();
    }, 0);
}
    startTyping();
});