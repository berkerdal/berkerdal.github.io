/* ============================================================
   Berker DAL — TR / EN dil desteği
   Kullanım: elemanlara data-i18n="anahtar" verilir;
   sözlükte hem tr hem en karşılığı bulunur.
   ============================================================ */

(function initI18n() {
  const DICT = {
    /* --- Profil --- */
    role: {
      tr: 'Araştırma Görevlisi',
      en: 'Research Assistant'
    },
    org: {
      tr: 'Pamukkale Üniversitesi<br>İktisadi ve İdari Bilimler Fakültesi<br>Yönetim Bilişim Sistemleri Bölümü',
      en: 'Pamukkale University<br>Faculty of Economics and Administrative Sciences<br>Department of Management Information Systems'
    },
    bio: {
      tr: 'Makine öğrenmesi, veri bilimi ve bu alanların uygulamalı problem çözme süreçlerinde kullanımı üzerine yoğunlaşır. Yapay zekâ tabanlı sistemler, üretken yapay zeka, doğal dil işleme ve karar destek sistemleriyle ilgilenir.',
      en: 'His work focuses on machine learning, data science, and their use in applied problem-solving. He is interested in AI-based systems, generative AI, natural language processing, and decision support systems.'
    },

    /* --- Sekmeler --- */
    tab_edu:      { tr: 'Eğitim',   en: 'Education' },
    tab_exp:      { tr: 'Deneyim',  en: 'Experience' },
    tab_pubs:     { tr: 'Yayınlar', en: 'Publications' },
    tab_projects: { tr: 'Projeler', en: 'Projects' },
    tab_files:    { tr: 'Dosyalar', en: 'Files' },
    tab_contact:  { tr: 'İletişim', en: 'Contact' },

    /* --- Eğitim --- */
    edu_title:   { tr: 'Öğrenim Bilgisi', en: 'Education' },
    uni_pau:     { tr: 'Pamukkale Üniversitesi', en: 'Pamukkale University' },
    uni_akdeniz: { tr: 'Akdeniz Üniversitesi', en: 'Akdeniz University' },
    edu_msc: {
      tr: 'Sosyal Bilimler Enstitüsü · Yönetim Bilişim Sistemleri (YL, Tezli)',
      en: 'Institute of Social Sciences · Management Information Systems (MSc, Thesis)'
    },
    edu_bsc: {
      tr: 'Uygulamalı Bilimler Fakültesi · Yönetim Bilişim Sistemleri (Lisans)',
      en: 'Faculty of Applied Sciences · Management Information Systems (BSc)'
    },
    edu_ba: {
      tr: 'Edebiyat Fakültesi · İngiliz Dili ve Edebiyatı (Lisans)',
      en: 'Faculty of Letters · English Language and Literature (BA)'
    },

    /* --- Deneyim --- */
    exp_title:    { tr: 'Deneyim', en: 'Experience' },
    grp_academic: { tr: 'Akademik Görevler', en: 'Academic Positions' },
    grp_admin:    { tr: 'İdari Görevler', en: 'Administrative Positions' },
    exp_years_1:  { tr: 'Nisan 2023 — Devam Ediyor', en: 'April 2023 — Present' },
    exp_org_1: {
      tr: 'Pamukkale Üniversitesi · İktisadi ve İdari Bilimler Fakültesi<br>Yönetim Bilişim Sistemleri Bölümü',
      en: 'Pamukkale University · Faculty of Economics and Administrative Sciences<br>Department of Management Information Systems'
    },
    exp_years_2: { tr: 'Eylül 2025 — Devam Ediyor', en: 'September 2025 — Present' },
    exp_role_2:  { tr: 'Yönetim Kurulu Üyesi', en: 'Member of the Board' },
    exp_org_2: {
      tr: 'Pamukkale Teknokent Teknoloji Transfer Ofisi A.Ş.',
      en: 'Pamukkale Teknokent Technology Transfer Office Inc.'
    },
    loc: { tr: 'Pamukkale, Denizli, Türkiye', en: 'Pamukkale, Denizli, Turkey' },

    /* --- Yayınlar --- */
    pubs_title:   { tr: 'Akademik Yayınlar', en: 'Academic Publications' },
    grp_articles: { tr: 'Makaleler', en: 'Journal Articles' },
    grp_papers:   { tr: 'Bildiriler', en: 'Conference Papers' },
    type_sci: {
      tr: 'SCI-Expanded · Özgün Makale · Uluslararası Hakemli',
      en: 'SCI-Expanded · Research Article · International Peer-Reviewed'
    },
    type_full: { tr: 'Uluslararası · Tam Metin Bildiri', en: 'International · Full-Text Paper' },
    type_abs:  { tr: 'Uluslararası · Özet Bildiri', en: 'International · Abstract Paper' },
    pub_mars_tr: {
      tr: "İstanbul'da Bina Sera Gazı Emisyonlarını Etkileyen Faktörlerin MARS Yöntemi ile İncelenmesi",
      en: 'Investigation of Factors Affecting Building Greenhouse Gas Emissions in Istanbul Using the MARS Method'
    },

    /* --- Projeler --- */
    projects_title: { tr: 'Projeler', en: 'Projects' },
    grp_ongoing:    { tr: 'Devam Eden', en: 'Ongoing' },
    type_tubitak:   { tr: 'TÜBİTAK 2209-A · 2025 / 1. Dönem', en: 'TÜBİTAK 2209-A · 2025 / Term 1' },
    proj_role:      { tr: 'Görev: Akademik Danışman', en: 'Role: Academic Advisor' },
    proj_1: {
      tr: 'BERTopic ve Büyük Dil Modelleri ile Türkçe Tiyatro Oyunu Yorumlarının Çok Boyutlu Analizi',
      en: 'Multidimensional Analysis of Turkish Theater Play Reviews Using BERTopic and Large Language Models'
    },
    proj_2: {
      tr: 'Büyük Dil Modelleri ve İnsan Yazımı Türkçe Akademik Özetlerin Bilimsel Yazım Standartları Açısından Karşılaştırmalı Analizi ve Türkçeye Uyumlu Bir Değerlendirme Çerçevesi Geliştirilmesi',
      en: 'Comparative Analysis of LLM-Generated and Human-Written Turkish Academic Abstracts in Terms of Scientific Writing Standards, and Development of a Turkish-Adapted Evaluation Framework'
    },
    proj_3: {
      tr: 'E-Ticaret Ürün Fotoğrafçılığında Görsel Kalitenin Referanssız Metrikler ile Nesnel Ölçümü',
      en: 'Objective Measurement of Visual Quality in E-Commerce Product Photography Using No-Reference Metrics'
    },
    proj_4: {
      tr: 'Kentsel Toplu Taşımada Erişilebilirlik ve Erişim Temelli Kentsel Konforun Açık Veri Tabanlı Ağ Analiziyle Modellenmesi: Denizli Örneği',
      en: 'Modeling Accessibility in Urban Public Transit and Access-Based Urban Comfort via Open-Data Network Analysis: The Case of Denizli'
    },
    proj_5: {
      tr: "KOBİ'lerin Dijital Dönüşümünde KAHVEM: Kahve Dükkanı İşletmeleri İçin Ölçeklenebilir Mobil Yönetim Bilişim Sistemi Modeli",
      en: 'KAHVEM in the Digital Transformation of SMEs: A Scalable Mobile Management Information System Model for Coffee Shop Businesses'
    },

    /* --- Dosyalar --- */
    files_title:     { tr: 'Paylaşılan Dosyalar', en: 'Shared Files' },
    file_cv:         { tr: 'Özgeçmiş (CV)', en: 'Curriculum Vitae (CV)' },
    file_cv_desc:    { tr: 'Güncel akademik özgeçmiş', en: 'Up-to-date academic CV' },
    file_notes:      { tr: 'Ders Notları', en: 'Lecture Notes' },
    file_notes_desc: { tr: 'Öğrenciler için paylaşılan materyaller', en: 'Materials shared with students' },
    course_441:      { tr: 'Veri Madenciliği Teknikleri', en: 'Data Mining Techniques' },

    /* --- İletişim --- */
    contact_title: { tr: 'İletişim', en: 'Contact' },
    contact_lead: {
      tr: 'Akademik iş birlikleri, ortak yayınlar ve projeler için bana ulaşabilirsiniz.',
      en: 'Feel free to reach out for academic collaborations, joint publications, and projects.'
    }
  };

  const toggle = document.getElementById('lang-toggle');
  const flag = document.getElementById('lang-flag');

  function applyLang(lang) {
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const entry = DICT[el.dataset.i18n];
      if (entry && entry[lang] !== undefined) el.innerHTML = entry[lang];
    });

    // Buton: aktif olmayan dilin bayrağını göster
    if (lang === 'tr') {
      flag.src = 'images/english.png';
      flag.alt = 'English';
      toggle.title = 'English';
    } else {
      flag.src = 'images/turkish.svg';
      flag.alt = 'Türkçe';
      toggle.title = 'Türkçe';
    }

    localStorage.setItem('site-lang', lang);

    // Sekme genişlikleri ve panel yükseklikleri değişti:
    // gösterge + kaydırma rayı kendini yenilesin, ağ katman adları güncellensin
    window.dispatchEvent(new Event('resize'));
    if (window.__netRebuild) window.__netRebuild();
  }

  toggle.addEventListener('click', () => {
    const next = document.documentElement.lang === 'tr' ? 'en' : 'tr';
    applyLang(next);
  });

  // Kayıtlı tercih varsa uygula (varsayılan: tr — HTML zaten Türkçe)
  const saved = localStorage.getItem('site-lang');
  if (saved === 'en') applyLang('en');
})();
