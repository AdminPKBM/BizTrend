async function fetchNews() {
    // Pastikan ID ini sama dengan yang ada di index.html (<div id="news-grid">)
    const container = document.getElementById('news-grid');
    const loading = document.getElementById('loading');
    
    // Gunakan beberapa sumber untuk backup
    const rssUrl = encodeURIComponent('https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664');
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();

        if (data.status === 'ok') {
            if (loading) loading.style.display = 'none';
            container.innerHTML = ''; // Bersihkan kontainer

            data.items.forEach((item, index) => {
                // 1. Membersihkan deskripsi dari tag HTML agar tidak merusak layout
                const cleanDescription = item.description.replace(/<[^>]*>?/gm, '');
                
                // 2. Mencari gambar (Cek thumbnail, lalu enclosure, lalu gambar di dalam deskripsi)
                let imageUrl = item.thumbnail || (item.enclosure && item.enclosure.link);
                
                // Jika masih kosong, coba cari tag <img> di dalam deskripsi asli
                if (!imageUrl) {
                    const imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
                    imageUrl = imgMatch ? imgMatch[1] : 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80';
                }

                // 3. Tampilan Bento Grid (Item pertama lebih besar)
                const isLarge = index === 0 ? "md:col-span-2 md:row-span-1" : "";

                const card = `
                    <article class="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col ${isLarge}">
                        <div class="relative ${index === 0 ? 'h-64' : 'h-48'} overflow-hidden">
                            <img src="${imageUrl}" alt="${item.title}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
                            <div class="absolute top-4 left-4">
                                <span class="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">Update</span>
                            </div>
                        </div>
                        <div class="p-6 flex flex-col flex-grow">
                            <h3 class="${index === 0 ? 'text-2xl' : 'text-lg'} font-bold text-slate-900 mb-3 leading-tight">
                                <a href="${item.link}" target="_blank" class="hover:text-emerald-600 transition">${item.title}</a>
                            </h3>
                            <p class="text-slate-500 text-sm mb-4 line-clamp-3">${cleanDescription}</p>
                            <div class="mt-auto flex justify-between items-center text-xs font-semibold text-slate-400">
                                <span>${new Date(item.pubDate).toLocaleDateString('id-ID')}</span>
                                <span class="text-emerald-600">Baca Selengkapnya →</span>
                            </div>
                        </div>
                    </article>
                `;
                container.innerHTML += card;
            });
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        if (loading) loading.innerHTML = `<p class="text-red-500 font-bold">Gagal memuat data. Periksa koneksi atau coba refresh.</p>`;
    }
}

// Jalankan fungsi
fetchNews();
