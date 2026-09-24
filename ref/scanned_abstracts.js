/* Abstracts and publication details for the 16 scanned PDFs (no text layer),
   transcribed by reading the page images on 2026-09-24.

   summarySource:
     "pdf"        the author's own abstract (Öz / Abstract), verbatim
     "pdf-intro"  the author's own words from the introduction, verbatim
                  (the page says so under the abstract)
     "editorial"  no abstract or usable introduction (a symposium speech):
                  a short factual description from the cover, labelled as such

   Publication details are filled only where the cover or running header was
   legible; nothing is guessed. Existing non-empty values are never replaced.

   Run: node ref/scanned_abstracts.js                                          */

const fs = require("fs");
const path = require("path");
const UI = require("../shared/admin-ui.mjs");

const FILE = path.join(__dirname, "..", "site", "content", "articles.json");

const S = {
  40: {
    summarySource: "pdf-intro",
    tr: "Arsa payı karşılığı inşaat sözleşmesi hâlâ yüksek mahkeme kararlarında dahi \"Kat Karşılığı İnşaat Sözleşmesi\", \"Kat Karşılığı Bina Yapım Sözleşmesi\" gibi hatalı isimlerle anılmaktadır. Türk Medeni Kanunu madde 1009, Tapu Kanunu madde 26, Tapu Sicil Tüzüğü madde 47 hükümlerince belirtildiği üzere yanlış isimlerle anılan bu sözleşme \"Arsa Payı Karşılığı İnşaat Sözleşmesi\"dir. Belirtmek gerekir ki kanun hükümlerinde \"arsa payı karşılığı inşaat sözleşmesi\" tabirinin kullanılması bu sözleşmeyi isimli (tipik) bir sözleşme yapmamaktadır, bu sözleşme karma isimsiz (atipik) sözleşme niteliğindedir.",
  },
  1: {
    summarySource: "pdf-intro",
    tr: "Uygulamada satım akitlerinde, bedelin birden fazla defada ödendiği hallerde ödemede temerrüde düşüldüğü takdirde semenin o ana kadar ödenmiş kısmının satıcıda kalacağına ilişkin koşullar getirilebilmektedir. Taşınmaz satışlarında da yaygın bir şekilde görülen bu tür uygulamalara, özellikle ödeme gücü ortak toplanmasına bağlı kooperatiflerin bu yöndeki ekonomik zayıflığı sonucu rastlanmaktadır. Böylelikle, taşınmaz satıcıları bu önemli baskı unsuru koşul ile alıcıları ödemeye zorlamış olmaktadırlar.",
  },
  2: {
    summarySource: "pdf-intro",
    tr: "Bilindiği gibi, 3227 sayılı \"Kat Mülkiyeti Kanununa Devre Mülk Hakkı İle İlgili Maddeler Eklenmesine Dair Kanun\"la yeni bir ayni hak yaratılmış oldu. Böylece, ayni haklarda hakim sınırlı sayıda olma prensibi uyarınca (numerus clausus), sayıları sınırlı ayni haklara yeni bir adet eklenmiş ve devre mülk hakkı, Medeni Kanunumuzun sistemi içindeki yerini almıştır.",
    meta: { journal: "Türkiye Noterler Birliği Hukuk Dergisi", issue: "62", date: "1989-05-15" },
  },
  4: {
    summarySource: "pdf",
    tr: "Uygulamada yoğunluğu artmış ve 6306 sayılı \"Afet Riski Altındaki Alanların Dönüştürülmesi Hakkındaki Kanun\" başlıklı yasa ile daha da artacağı kuşkusuz olan arsa payı karşılığı inşaat sözleşmeleri konusunda yaşanan ve tüm ilgililere yansıyan hatalar anlaşılır gibi değildir. Araştırmamızın amacı bilimsel gerçeklikler karşısında, bu hataların neredeyse \"galat-ı meşhur\" niteliği kazanarak hukuki doğruyu söyleyenlerin küçümsendiği noktaya gelmeden bilimsel gerçekleri ortaya koymaktan ibarettir.",
    meta: { journal: "İstanbul Barosu Dergisi", volume: "87", issue: "1", date: "2013" },
  },
  9: {
    summarySource: "pdf-intro",
    tr: "Türkiye; hızla gelişen ve büyüyen inşaat sektörü karşısında yatırımların güvenli hukuk sistemine kavuşabilmesi amacıyla bilimsel ve çağdaş çözümlere dayalı yasa değişiklikleri yapma konusunda geç bile kalmıştır. Taşınmaz hukuku 11 branştan oluşan, hukukun en zor branşlarından biri. Hem özel hem de kamu hukuku alanlarını ilgilendirmesi sonucu, bu alana hakimiyet oldukça güçleşiyor.",
    meta: { journal: "Gayrimenkul Türkiye", issue: "45", date: "2015-09" },
  },
  18: {
    summarySource: "pdf-intro",
    tr: "Resmi Gazetede 31.05.2012 tarihinde yürürlüğe giren 6306 sayılı \"Afet Riski Altındaki Alanların Dönüştürülmesi Hakkında Kanun\" yürürlüğe girdiği tarihinden itibaren uygulamada karşılaşılan güçlükler ve çıkan sorunlar karşısında birçok tartışmayı da beraberinde taşımaktadır. 6306 sayılı yasa özünde doğruluğuna rağmen teknik hatalarla yürürlüğe girmiştir. Bu hataların telafisi Uygulama Yönetmeliği ile giderilebilecekken bu güne kadar arka arkaya üç yönetmelik yürürlüğe girmesine rağmen işin ciddiyetinin anlaşılamadığı apaçık ortadadır.",
    meta: { journal: "Standard — Ekonomik ve Teknik Dergi", date: "2013-10" },
  },
  20: {
    summarySource: "pdf",
    tr: "Tip Ana sözleşmelerindeki amaçları doğrultusunda yapılaşmalarını tamamlayarak ferdileşme sürecine girmiş yapı kooperatiflerinin ferdileşme sonrası hukuka aykırı olarak kat mülkiyeti yönetimi görevini de üstlenmeleri uygulamada sıklıkla rastlanılan uyuşmazlıkların temelini oluşturmaktadır. Birbirinden tamamen farklı oluşumlar olan kooperatif tüzel kişiliği ile kat mülkiyeti yöneticiliğinin görev ve yetkilerinin kapsamının dikkatlice ayrıştırılması gerekmektedir. Ferdileşme sonrası mülkiyetinde bağımsız bölüm bulunan yapı kooperatifi salt bu bağımsız bölümlerin varlığına dayalı yönetimde hak iddia edemeyecek buna karşın ya işletme kooperatifine dönüşmesi ya da bu bağımsız bölümlerin eşyaya bağlı mülkiyet olarak tüm kat malikleri adına tescilini sağlaması gerekecektir. Zira; ferdileşmenin tamamlanmasıyla kat malikleri birliği kendiliğinden oluşmuş olacaktır. Artık başlı başına varlık bulan kat mülkiyeti oluşumu karşısında; yönetimde hak iddia eden kooperatif tüzel kişiliğinin bu sıfatla kat maliklerinden aidat adı altında para toplaması yasal değildir. Ancak böyle bir yöneticiliği fiilen sürdürmesi halinde ise genel hükümler uyarınca hak sahibi olabilecekse de işletme avans payı talebi yasal olmayacaktır.",
    en: "The illegal assumption of condominium ownership management by the construction cooperatives which entered into individualization after completing their structures in accordance with their purposes in the standard articles of association after individualization process constitutes the basis of conflicts that are experienced frequently in legal practice. The tasks and powers of cooperative legal entities and condominium ownership managers which are completely different constitutions should be differentiated carefully. After individualization process, construction cooperatives that own independent sections cannot claim rights on the management solely relying on the existence of these independent sections; they should be converted into a management cooperative or they should see that these independent sections are be registered in the name of all independent section owners as an ownership in rem. Because the flat ownership unity will be formed per se upon the completion of the individualization process. It is illegal for the cooperative legal entity to claim rights regarding the management and to collect money from the condominium owners under the name of \"contribution\" in the face of the formation of condominium ownership which is an entity by itself. In case the cooperative continues with such management in a de facto manner, it will be entitled to rights in according to general provisions, however its claims regarding advance contribution fee claims will not be legal.",
    kwTr: ["Yapı Kooperatifleri", "Kat Mülkiyeti", "Kat Malikleri Birliği", "Kat Malikleri Kurulu", "Ferdileşme", "Yönetim", "Vekâletsiz İş Görme"],
    kwEn: ["Construction Cooperatives", "Condominium Ownership", "Union of Condominium Owners", "Committee of Condominium Owners", "Individualization", "Management", "Acting without authority"],
  },
  21: {
    summarySource: "pdf",
    tr: "Temsil yetkisi belgeleri uygulamada, belirtilmesi zorunlu olmadığı halde, temsil konusu tüm hukuki işlemler tek tek sayılmak suretiyle ve bu şekilde gereksiz derecede detaylı bir biçimde kaleme alınmaktadır. Ayrıca bu temsil yetkisi belgeleri yanlış şekilde \"vekâletname\" şeklinde adlandırılmaktadır. Türk Borçlar Hukuku Sistemi, her türlü hukuki işlemi gerçekleştirme yetkisi veren genel bir temsil yetkisi sistemini benimsemiştir; bu genel temsil yetkisinin sınırlandırılması ya da özelleştirilmesi ise kanuni ve iradi sebeplerle gerçekleşmektedir ve istisna teşkil etmektedir. Esasen kanunda özel olarak belirtilmesi gerektiği emredilmeyen hiçbir hukuki işlemin, temsil yetkisinde belirtilmesine gerek yoktur.",
    en: "In general practice certificates of representation are drafted in a manner in which they contain each and every subject of the representation one by one with unnecessary detail and length despite the fact that they do not have to. Furthermore these certificates are wrongfully called as \"Power of Attorney\". Turkish Obligation Law System adopted a general representation authorization where it grants the representation to perform all legal transactions; limitation or customization of this general representation is realized with legal or voluntary reasons and this constitutes an exception. In principle, legal transactions that do not need to be explicitly stated by the mandatory provisions of the law do not need to be specified in the certificate of representation.",
    kwTr: ["Temsil yetkisi", "Temsil yetkisinin niteliği", "Tek taraflı hukuki işlem", "Şekle bağlılık", "Bağımsız", "Emredici hüküm"],
    kwEn: ["Power of attorney", "Qualification of power of attorney", "Ex parte", "Legal transaction", "Former commitment", "Self contained", "Mandatory rule"],
  },
  22: {
    summarySource: "pdf",
    tr: "Son yıllarda Yargıtay, arsa payı karşılığı inşaat sözleşmelerinde arsa sahibinin yükleniciye devrettiği arsa paylarına ilişkin olarak \"avans\" tabirini kullanmaktadır. Arsa sahibinin geçerli sebebe dayanarak sözleşmeden dönmesinden önce yüklenicinin \"avans tapu\" olarak anılan arsa payları üzerindeki mülkiyet hakkını üçüncü kişiye devretmesi durumunda, işbu tasarruf işleminin geçerliliği göz ardı edilerek üçüncü kişi adına tescilin yolsuz hale geldiği kabul edilmektedir. Dolayısıyla ayni etkili dönme görüşüyle paralellik arzederek verilen kararlar sonucu Yargıtay'ın haksız uygulamalarıyla, tapu kütüğündeki sicile güvenerek yükleniciden aynî hak kazanan üçüncü kişiler mağdur edilmektedir. Çalışmamızda bu hatalı uygulamanın neden terkedilmesi gerektiği hakkında açıklamalar yapılmış ve somut örneklerle mağduriyetler dile getirilmeye çalışılmıştır.",
    en: "In recent years, the Supreme Court terms \"advance loan\" related to the land shares which has been transferred by the landlord to the contractor under construction agreement in return for land share. Before the landlord withdraws the agreement on a valid ground, in the event that the contractor transferred the possession right of \"land share as an advance loan\" to the third person, such act of disposal's validity is ruled out and it is accepted that the entry of the name of third person is unwarranted. Due to the Supreme Court's unfair practice, third persons who have the possession right from the contractor, are suffered. In our article, the explanations on why it should be given up such unfair practice are worded and the unfair sufferings are tried to be mentioned with the concrete samples.",
    kwTr: ["Arsa Payı Karşılığı İnşaat Sözleşmesi", "Avans Tapu", "Avans Kavramı", "Dönme", "Fesih", "Üçüncü Kişiye Etki", "Tescili İsteme", "Yolsuz Tescil", "İyiniyet"],
    kwEn: ["Construction Agreement in Return for Land Share", "Land Share as an Advance Loan", "Withdrawal (ex tunc)", "Withdrawal (ex nunc)", "Effect to Third Person", "Right to Registration", "Unwarranted Entry", "Bona Fide"],
    meta: { journal: "Maltepe Üniversitesi Hukuk Fakültesi Dergisi", issue: "1", date: "2016" },
  },
  25: {
    summarySource: "pdf-intro",
    tr: "Kooperatifler Kanununa dayalı olarak tüzel kişilik çatısı altında ve bir amaç etrafında toplanmış ortakların bu ilişki içerisinde çeşitli borçlarla yükümlü olacakları kuşkusuzdur. Uygulamada yapı ve diğer bazı kooperatif türlerinde sermaye unsuru yalnızca sembolik bir fonksiyon görür hale gelmiştir; bu gün öne çıkan, Kanunun deyimi ile «sair ödemeler»dir. Araştırmanın amacı, gereken ilgiyi kanuni düzenleme olarak görmeyen ortaklık payı dışındaki ödemeler konusuna, öncelikle niteliğini ve geçerlilik koşullarını saptamak suretiyle açıklık getirmektir.",
  },
  26: {
    summarySource: "pdf-intro",
    tr: "Araştırma konumuz haczin, taşınmaz üzerindeki tasarruf yetkisini şerh sonucu nasıl etkileyeceğidir. Konu her ne kadar genel bir madde ile düzenlenmiş ve «bu tasarruf tahditleri tapu siciline şerh verilmekle gayrimenkul üzerinde sonradan iktisap olunan her nevi hakların sahiplerine karşı dermeyan olunabilir» hükmü ile hukuki sonuca bağlanmış ise de, her bir şerh hali aynı bent altında dahi farklılık arzetmektedir. İşte, araştırma yalnızca hacizlerin şerhi ile sınırlı olarak dağınık bilgileri toparlamak amacındadır. Bu çerçeve içinde yalnızca hacizlerin şerhinin taşınmazlar üzerinde mevcut ayni haklara etkisini hukuki sonuçları ile saptamak arzusundayız.",
    meta: { journal: "Ankara Barosu Dergisi", issue: "2", date: "1991-03" },
  },
  27: {
    summarySource: "pdf-intro",
    tr: "Yargıtay Hukuk Genel Kurulu 1996/6-300 Esas ve 1996/506 sayılı kararı oybirliği ile vermiş bulunmaktadır. M.K'un 626. Maddesi ile ilgili olarak verilmiş bulunan bu karara eleştiriler getireceğiz. 1991 yılında yürürlüğe girmiş bu madde ile ilgili olarak ilk olduğunu zannettiğimiz bu genel kurul kararında içtihad olma sonucu benzer uyuşmazlıklarda gözönüne alınmayı gerektirecek özellikler bulunmamaktadır. Paydaşlıktan çıkarma davasına bağlı olarak gerek maddi koşulların saptanmasında gerekse bir karardan beklenen gerekçe doyuruculuğuna sahip bulunmayarak eksikliklerle dolu olan bu karar bizi bu araştırmaya yöneltmiş bulunmaktadır.",
    meta: { journal: "Türkiye Barolar Birliği Dergisi", issue: "2", date: "1996" },
  },
  30: {
    summarySource: "pdf",
    tr: "Bu çalışmada, ipotekle yüklü taşınmaz mülkiyetinin devri işlemi sırasında tapu sicil daireleri tarafından Tapu Sicil Müdürlüklerince Düzenlenen Resmî Senetlere İlişkin Usul ve Esaslar Hakkında Yönetmelik m.10 hükmü gereği resmî senede geçirilmek üzere alınan beyanların, Yargıtay tarafından yanlış yorumlanmasıyla ortaya çıkan fahiş hatalı içtihat değerlendirilecektir. Bu içtihatla birlikte, amacı bakımından yerinde bulduğumuz ancak içeriği göz önüne alındığında hem tapu sicil müdürlüklerini hem de Yargıtay'ı birlikte hataya sevk eden yönetmelik hükmü eleştirilecektir. Bu yolda hükmün yeniden düzenlenmesi adına olması lazım gelen (de lege ferenda) önerimizi sunarak, kararın gerekçesindeki yanlış nitelemeleri hukukî gerekçelerle gözler önüne serip, bu yolda benzer hatalara düşülmemesi ve aynı yönde kararların verilmemesi umuduyla makalemizi kaleme almış bulunmaktayız.",
    en: "In this work, we will assess a blatantly wrong ruling of the Supreme Court arising from the wrong construction of the statements obtained by the land registries to issue to the official certificate during the transfer of properties encumbered with mortgages in accordance with the Article 10 of the Regulation on the Procedures and Principles regarding the Official Certificates issued by Land Registries. Along with this ruling we will also criticize the provision of the regulation which we deem accurate in terms of purpose, however misleads both the land registry directorates and the Supreme Court in terms of content. Therefore we wrote this article with the purpose of preventing errors in the same framework and opinions in the same direction by bringing forth our de lege ferenda suggestion for redrafting the provision by demonstrating the erroneous qualifications with legal grounds.",
    kwTr: ["İpotek", "Tapu Sicil Müdürlüklerince Düzenlenen Resmî Senetlere İlişkin Usul ve Esaslar Hakkında Yönetmelik", "Türk Medenî Kanunu", "Türk Borçlar Kanunu", "Borcun Üstlenilmesi"],
    kwEn: ["Mortgage", "The Regulation on the Procedures and Principles regarding the Official Certificates issued by Land Registries", "Turkish Civil Code", "Turkish Code of Obligations", "Assumption of Indebtedness"],
    meta: { journal: "Maltepe Üniversitesi Hukuk Fakültesi Dergisi", issue: "2", date: "2018" },
  },
  32: {
    summarySource: "pdf-intro",
    tr: "Günümüzdeki ihtiyaçlar çerçevesinde uygulamada görülen yapılaşmalar nedeniyle artık doğan uyuşmazlıklara yeterince çözüm getiremeyen 634 sayılı Kat Mülkiyeti Kanunu'nda değişiklik yapmak amacıyla, Adalet Bakanlığınca hazırlanan, halen TBMM Adalet Komisyonu gündeminde bulunan tasarı bu incelemenin konusunu oluşturmakta olup 16.10.2000 tarihinde Adalet Bakanlığı Kanunlar ve Kararlar Dairesi Genel Müdürlüğünün takdirlerine sunulmuştur.",
    meta: { journal: "İstanbul Barosu Dergisi", volume: "74", issue: "10-11-12", date: "2000-12" },
  },
  33: {
    summarySource: "pdf-intro",
    tr: "Kat mülkiyetine bağlı bağımsız bölümlerin içinde yer aldığı anataşınmazın diğer tamamlayıcı unsurları «ortak yer» ve «eklenti»lerdir. Amacımız, bu ayırım altında «bahçeler»in hukuki niteliğini saptamaktadır. Günümüzde kentleşmenin doğurduğu sancıların giderilmesinde yeşile ve oyun alanlarına verilen önem büyüktür. Bahçe terimine açık bir şekilde ilgili hükümlerde yer verilmemiş olması ve bunun yanında doktrinde konu üzerinde yeteri ağırlıkta eğilinmemesi bizi bu konunun seçimine özendirmiştir. Diğer yönden, konu ile ilgili Yargıtay içtihatlarını da araştırma konusu yapmak gerekecektir.",
    meta: { journal: "Türkiye Barolar Birliği Dergisi", issue: "1", date: "1990" },
  },
  43: {
    summarySource: "editorial",
    tr: "6098 sayılı Türk Borçlar Kanunu'nun taşınmaz satışına ilişkin hükümlerini değerlendiren bu tebliğ, 3-4 Haziran 2011 tarihlerinde düzenlenen \"6098 Sayılı Türk Borçlar Kanunu Hükümlerinin Değerlendirilmesi Sempozyumu\"nda sunulmuş ve Marmara Üniversitesi Hukuk Fakültesi Hukuk Araştırmaları Dergisi'nin Prof. Dr. Cevdet Yavuz'a Armağan özel sayısında yayımlanmıştır.",
    en: "This paper, which assesses the provisions of Turkish Code of Obligations No. 6098 on the sale of real property, was presented at the symposium on the provisions of the new Code held on 3–4 June 2011 and published in the Marmara University Faculty of Law Journal of Legal Research, special issue in honour of Prof. Dr. Cevdet Yavuz.",
    meta: { journal: "Marmara Üniversitesi Hukuk Fakültesi Hukuk Araştırmaları Dergisi (Prof. Dr. Cevdet Yavuz'a Armağan)", date: "2012" },
  },
};

const doc = JSON.parse(fs.readFileSync(FILE, "utf8"));
let n = 0;
for (const [id, s] of Object.entries(S)) {
  const a = doc.articles.find((x) => x.id === Number(id));
  if (!a) { console.log("missing article", id); continue; }
  if (a.summary && a.summary.tr) { console.log("skip", id, "(already has an abstract — edited in the panel?)"); continue; }
  a.summary = Object.assign({}, a.summary, { tr: s.tr, en: s.en || (a.summary && a.summary.en) || null });
  a.summarySource = s.summarySource;
  if (s.kwTr) a.keywords = Object.assign({}, a.keywords, { tr: s.kwTr, en: s.kwEn || (a.keywords && a.keywords.en) || [] });
  for (const [k, v] of Object.entries(s.meta || {})) {
    if (a[k] == null || a[k] === "") a[k] = v;
  }
  if (a.date && !a.year) a.year = parseInt(a.date.slice(0, 4), 10);
  if (s.meta && s.meta.date && (!a.dateSource || a.dateSource === "site")) a.dateSource = a.dateSource || "pdf-cover";
  a.needs = Object.assign({}, a.needs, { summary: false, date: !a.date, journal: !a.journal });
  n++;
}
fs.writeFileSync(FILE, UI.articlesDoc(doc, doc.articles), "utf8");
console.log("updated %d articles; stats:", n, JSON.stringify(UI.articleStats(doc.articles)));
