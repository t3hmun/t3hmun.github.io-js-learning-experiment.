/** Templating without using any libries with exotic styles of markup.
 * It's not as pretty as I imagined but it is not hard to understand.
 */
var template = module.exports = function(site, page){

	var navitems = '';
	site.nav.forEach(function(item){
		navitems +=`<span class="navitem">${item}</span>`;
	});

	var head = head(site, page);
	
	return`<!DOCTYPE html>
<html lang="en-GB">
${head}
<body>
  <div>
    <header>
      <div class="masthead">
      	${site.title}
      </div>
      <nav>
        <div class="nav">
          ${navitems}
        </div>
      </nav>
    </header>
    <main>
      ${page.content}
    </main>
    <footer>
      <div class="footer">
        Web log content licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a>.
      </div>
    </footer>
</body>
</html>`;
}

var head = function(site, page){
	return `<head>
<meta charset="utf-8">
<!-- Suppress Internet Explorer's compatibility mode minimise quirks. -->
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<!-- This informs small screen devices that the content is intended to wrap inside the screen-width without scaling. 
This prevents the phone from rendering a miniature parody of the desktop appearance of the site.
The design of the site must be suitable for this kind of wrapping in a smaller space. -->
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- A description for search engines and other non-humans. If the page has not description set default to site description. -->
<meta name="description" content="${page.description ? page.description : site.description}">
<!-- Title used by the browser and also by search engines and non-humans. -->
<title>${page.title}</title>
<!-- The root relative url for the stylesheet. -->
<link id="maincss" rel="stylesheet" href="${site.baseurl}/css/main.css">
<!-- The preferred URL for the page. Useful when there are multiple possible urls. -->
<link rel="canonical" href="${site.baseurl}${page.url.replace('index.html', '')}">
<!-- Handy link to the RSS for the site for browsers and non-humans. -->
<link rel="alternate" type="application/rss+xml" title="${site.title}" href="${site.baseurl}/feed.xml" />
<script src="${site.baseurl}/js/theme.js"></script>
</head>`;
};