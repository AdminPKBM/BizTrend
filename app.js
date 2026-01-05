async function fetchNews() {
    // Mencari elemen news-grid (Sudah disesuaikan dengan HTML di atas)
    const container = document.getElementById('news-grid');
    const loading = document.getElementById('loading');
    
    if (!container) {
        console.error("Error: Elemen 'news-grid' tidak ditemukan di HTML!");
        return;
    }

    const rssUrl = encodeURIComponent('https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664');
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.status === 'ok') {
            if (loading) loading.style.display = 'none';
            container.innerHTML = ''; 

            data.items.forEach((item, index) => {
                const cleanDescription = item.description.replace(/<[^>]*>?/gm, '');
                
                // Logika pengambilan gambar yang lebih kuat
                let imageUrl = item.thumbnail || (item.enclosure && item.enclosure.link);
                if (!imageUrl || imageUrl.includes('placeholder')) {
                    const imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
                    imageUrl = imgMatch ? imgMatch[1] : 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80';
                }

                // Bento Grid: Item pertama memanjang ke samping di layar lebar
                const isLarge = index === 0 ? "lg:col-span-2" : "";

                const card = `
                    <article class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col ${isLarge}">
                        <div class="relative ${index === 0 ? 'h-72' : 'h-48'} overflow-hidden">
                            <img src="${imageUrl}" alt="${item.title}" class="w-full h-full object-cover transform hover:scale-110 transition duration-700">
                            <div class="absolute top-4 left-4">
                                <span class="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-widest">
                                    Global Finance
                                </span>
                            </div>
                        </div>
                        <div class="p-6 flex flex-col flex-grow">
                            <h3 class="${index === 0 ? 'text-2xl' : 'text-lg'} font-extrabold text-slate-900 mb-3 leading-tight tracking-tight">
                                <a href="${item.link}" target="_blank" class="hover:text-emerald-600 transition-colors">
                                    ${item.title}
                                </a>
                            </h3>
                            <p class="text-slate-500 text-sm mb-6 line-clamp-2 italic">${cleanDescription}</p>
                            <div class="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                                <span>${new Date(item.pubDate).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}</span>
                                <span class="text-emerald-600">Full Report →</span>
                            </div>
                        </div>
                    </article>
                `;
                container.innerHTML += card;
            });
            
            // Inisialisasi ikon jika library lucide ada
            if (typeof lucide !== 'undefined') lucide.createIcons();
            
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        if (loading) loading.innerHTML = `<p class="text-red-500 font-bold italic text-sm">Koneksi API terputus. Silakan segarkan halaman.</p>`;
    }
}

fetchNews();
