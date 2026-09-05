import re,sys,html
f=sys.argv[1]
s=open(f,encoding='utf-8',errors='replace').read()
m=re.search(r'<main.*?</main>',s,re.S) or re.search(r'<body.*?</body>',s,re.S)
s=m.group(0) if m else s
s=re.sub(r'<(script|style|nav|header|footer)[^>]*>.*?</\1>','',s,flags=re.S|re.I)
s=re.sub(r'<a [^>]*href="([^"]+)"[^>]*>(.*?)</a>',lambda x:' ['+re.sub('<[^>]+>','',x.group(2)).strip()+'](' + x.group(1)+') ',s,flags=re.S)
s=re.sub(r'<img [^>]*src="([^"]*)"[^>]*>',r' {IMG \1} ',s)
s=re.sub(r'<br[^>]*>|</p>|</h\d>|</li>|</tr>|</div>','\n',s,flags=re.I)
s=re.sub(r'<[^>]+>',' ',s)
s=html.unescape(s)
s=re.sub(r'[ \t]+',' ',s)
s=re.sub(r'\n\s*\n+','\n',s)
print(s.strip())
