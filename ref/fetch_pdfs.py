import json,os,re,urllib.request,ssl,traceback
ctx=ssl.create_default_context(); ctx.check_hostname=False; ctx.verify_mode=ssl.CERT_NONE
d=json.load(open('makaleler.json',encoding='utf-8'))
os.makedirs('pdfs',exist_ok=True)
import pymupdf
out=[]
for i,a in enumerate(d):
    rec={"id":i+1,"title":a["t"],"pdf":a["pdf"],"ok":False}
    fn=f"pdfs/{i+1:02d}.pdf"
    try:
        if not os.path.exists(fn) or os.path.getsize(fn)<2000:
            req=urllib.request.Request(a["pdf"],headers={"User-Agent":"Mozilla/5.0"})
            with urllib.request.urlopen(req,context=ctx,timeout=90) as r, open(fn,'wb') as f:
                f.write(r.read())
        rec["bytes"]=os.path.getsize(fn)
        doc=pymupdf.open(fn)
        rec["pages"]=doc.page_count
        txt="\n".join(doc[p].get_text() for p in range(min(4,doc.page_count)))
        doc.close()
        txt=re.sub(r'[ \t]+',' ',txt)
        txt=re.sub(r'\n{3,}','\n\n',txt)
        rec["head"]=txt[:6000]
        rec["ok"]=True
    except Exception as e:
        rec["err"]=f"{type(e).__name__}: {e}"
    out.append(rec)
    print(i+1, rec["ok"], rec.get("pages"), rec.get("err",""), flush=True)
json.dump(out,open('pdf_text.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
print("DONE", sum(1 for r in out if r["ok"]), "/", len(out))
