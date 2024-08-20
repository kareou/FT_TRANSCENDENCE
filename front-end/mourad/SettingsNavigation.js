window.onload = function()
{
    const sidebarItems = Array.from(document.getElementsByClassName('sidebar-item'));
    const contentContainers = document.querySelectorAll('.content-item');
    function navigateTo(target) {
        let urlTarget = target.replace('-container', '');
        if (window.history && window.history.pushState) {
            window.history.pushState({}, null, `/${urlTarget}`);
        }
        
        contentContainers.forEach(container => container.classList.remove('active'));
        
        document.getElementById(target).classList.add('active');
    }
    
    sidebarItems.forEach(item => {
        item.addEventListener('click', (event) => {
            const target = event.target.closest('.sidebar-item').dataset.target;
            navigateTo(target);
        });
    });
    
    let initialRoute = window.location.pathname.slice(1);
    if (initialRoute) {
        initialRoute += '-container';
        navigateTo(initialRoute);
    }
};