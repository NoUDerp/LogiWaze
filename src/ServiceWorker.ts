if (location.protocol !== 'https:' && (location.hostname.toLowerCase() == "www.logiwaze.com" || location.hostname.toLowerCase() == "logiwaze.com"))
    location.replace('https:'.concat(location.href.substring(location.protocol.length)));

if ("serviceWorker" in navigator) {
    window.addEventListener("load", async function () {
        try {
            let res = await navigator.serviceWorker.register(new URL("../ServiceWorker.js", import.meta.url), {type:'module'});
            await res.update();
        } catch (err) {
            console.log("service worker not registered", err);
        }
    });
}