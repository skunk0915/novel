window.addEventListener('load', function () {

        const content = document.querySelector('.story');
        const index = document.querySelector('.index');
        const headings = content.querySelectorAll('h2, h3');
        const indexItems = [];
        headings.forEach((heading, i) => {
            const id = `heading-${i}`;
            heading.id = id;

            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${id}`;
            a.textContent = heading.textContent;
            a.classList.add(heading.tagName.toLowerCase());

            a.addEventListener('click', (e) => {
                e.preventDefault();
                heading.scrollIntoView({ behavior: 'smooth' });
            });

            li.appendChild(a);
            indexItems.push(li);

            if (heading.tagName === 'H3' && indexItems.length > 1) {
                const lastItem = indexItems[indexItems.length - 2];
                if (!lastItem.querySelector('ul')) {
                    const ul = document.createElement('ul');
                    lastItem.appendChild(ul);
                }
                lastItem.querySelector('ul').appendChild(li);
            } else {
                index.appendChild(li);
            }
        });

})
