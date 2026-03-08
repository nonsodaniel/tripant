// Inlined script executed before React hydration to prevent dark-mode flash.
export function ThemeScript() {
  const script = `
    (function(){
      try {
        var stored = localStorage.getItem('tripant:theme');
        var dark = stored === 'dark' ||
          (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
        if (dark) document.documentElement.classList.add('dark');
      } catch(e){}
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
