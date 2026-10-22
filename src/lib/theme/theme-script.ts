/**
 * Runs in <head> before anything paints, so the page never flashes the wrong theme.
 * It also follows the operating system's setting while the choice is "system".
 * Keep the storage key in step with THEME_STORAGE_KEY in theme.ts.
 */
export const THEME_SCRIPT = `(function(){try{var q=window.matchMedia("(prefers-color-scheme: dark)");function a(){var m=null;try{m=localStorage.getItem("ic-theme")}catch(e){}document.documentElement.dataset.theme=(m==="dark"||(m!=="light"&&q.matches))?"dark":"light"}a();q.addEventListener("change",a);window.addEventListener("storage",a);window.addEventListener("ic-theme-change",a)}catch(e){}})();`;
