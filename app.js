async function fetchNews() {
    const sources = [
        'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664', // CNBC Finance
        'https://www.forbes.com/innovation/feed/' // Forbes
    ];

    const container = document.getElementById('news-container');
    const loading = document.getElementById('loading');

    try {
        // Kita gunakan API rss2json (Gratis) untuk konversi XML ke JSON
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${sources[0]}`);
        const data = await response.json();

        loading.style.display = 'none';

        if (data.status === 'ok') {
            data.items.forEach(item => {
                const card = `
                    <article class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300">
                        <img src="${item.enclosure.link || 'https://via.placeholder.com/400x200?text=Business'}" 
                             alt="${item.title}" class="w-full h-48 object-cover">
                        <div class="p-4">
                            <h3 class="font-bold text-lg mb-2 leading-tight">
                                <a href="${item.link}" target="_blank" class="hover:text-blue-600">${item.title}</a>
                            </h3>
                            <p class="text-sm text-gray-600 mb-4">${item.description.substring(0, 120)}...</p>
                            <div class="flex justify-between items-center text-xs text-gray-500">
                                <span>${new Date(item.pubDate).toLocaleDateString()}</span>
                                <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded">Bisnis</span>
                            </div>
                        </div>
                    </article>
                `;
                container.innerHTML += card;
            });
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        loading.innerText = 'Gagal memuat data. Silakan coba lagi nanti.';
    }
}

fetchNews();
