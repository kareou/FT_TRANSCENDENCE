window.history.pushState({}, {}, window.location.origin);

const app = document.querySelector('#app');

const route = "/";

const links = document.querySelectorAll('.link');

links.forEach((link) => {
    link.addEventListener('click' , (e) =>{
        e.preventDefault();
        let href = link.getAttribute('href');
        if (href.length > 1)
            href = href.substring(1, href.length);
        if (href === '/')
        {
            window.history.pushState({}, href, window.location.origin + href);
            console.log("in here "+ href)
        }
        else
            window.history.pushState({}, href, window.location.origin + '/' + href);
        console.log(href);
    })
});