// Simpan data secara global agar bisa diakses oleh Modal
let newsData = [];

async function fetchNews() {
    const container = document.getElementById('news-grid');
    const loading = document.getElementById('loading');
    
    if (!container) return;

    const rssUrl = encodeURIComponent('https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664');
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.status === 'ok') {
            newsData = data.items; // Simpan ke variabel global
            if (loading) loading.style.display = 'none';
            container.innerHTML = ''; 

            newsData.forEach((item, index) => {
                const cleanDescription = item.description.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...';
                
                let imageUrl = item.thumbnail || (item.enclosure && item.enclosure.link);
                if (!imageUrl || imageUrl.includes('placeholder')) {
                    const imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
                    imageUrl = imgMatch ? imgMatch[1] : 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80';
                }

                const isLarge = index === 0 ? "lg:col-span-2" : "";

                const card = `
                    <article class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col ${isLarge}">
                        <div class="relative ${index === 0 ? 'h-72' : 'h-48'} overflow-hidden">
                            <img src="${imageUrl}" alt="${item.title}" class="w-full h-full object-cover transform hover:scale-110 transition duration-700">
                        </div>
                        <div class="p-6 flex flex-col flex-grow">
                            <h3 class="${index === 0 ? 'text-2xl' : 'text-lg'} font-extrabold text-slate-900 mb-3 leading-tight">
                                ${item.title}
                            </h3>
                            <p class="text-slate-500 text-sm mb-6">${cleanDescription}</p>
                            <div class="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center text-[11px] font-bold">
                                <span>${new Date(item.pubDate).toLocaleDateString('id-ID')}</span>
                                <button onclick="openFullArticle(${index})" class="text-emerald-600 hover:underline cursor-pointer uppercase">
                                    Read Full Report →
                                </button>
                            </div>
                        </div>
                    </article>
                `;
                container.innerHTML += card;
            });
            
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    } catch (error) {
        console.error('Fetch Error:', error);
    }
}

// FUNGSI UNTUK MENGAMBIL ISI LENGKAP (SCRAPING VIA PROXY)
async function openFullArticle(index) {
    const item = newsData[index];
    const modal = document.getElementById('news-modal');
    const modalBody = document.getElementById('modal-body');
    
    // Tampilkan modal dengan loading
    modal.classList.remove('hidden');
    modalBody.innerHTML = '<div class="flex justify-center p-10"><div class="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div></div>';

    try {
        // Menggunakan CORS Proxy gratis untuk mengambil HTML dari CNBC
        const proxyUrl = 'https://api.allorigins.win/get?url=';
        const response = await fetch(proxyUrl + encodeURIComponent(item.link));
        const data = await response.json();
        
        // Parsing HTML yang didapat
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, 'text/html');
        
        // Cari elemen artikel di CNBC (Biasanya ada di class .ArticleBody-articleBody)
        // Jika tidak ketemu, kita ambil paragraf-paragraf utama
        let fullText = '';
        const articleElements = doc.querySelectorAll('.ArticleBody-articleBody p, .group p');
        
        if (articleElements.length > 0) {
            articleElements.forEach(p => {
                fullText += `<p class="mb-4 text-slate-700 leading-relaxed">${p.innerText}</p>`;
            });
        } else {
            fullText = "<p>Gagal mengekstrak isi artikel secara otomatis. Silakan baca di sumber asli.</p>";
        }

        // Masukkan ke dalam modal
        modalBody.innerHTML = `
            <img src="${item.thumbnail || ''}" class="w-full h-64 object-cover rounded-xl mb-6">
            <h2 class="text-3xl font-black mb-4 text-slate-900">${item.title}</h2>
            <div class="prose max-w-none">
                ${fullText}
            </div>
            <hr class="my-6">
            <a href="${item.link}" target="_blank" class="inline-block bg-slate-900 text-white px-6 py-2 rounded-lg font-bold">Buka di Sumber Asli</a>
        `;

    } catch (error) {
        modalBody.innerHTML = `<p class="text-red-500">Gagal memuat konten. Link asli: <a href="${item.link}">${item.link}</a></p>`;
    }
}

// Fungsi tutup modal
function closeModal() {
    document.getElementById('news-modal').classList.add('hidden');
}

fetchNews();
