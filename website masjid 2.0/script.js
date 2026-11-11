document.addEventListener("DOMContentLoaded", () => {
    // 1. Slider Setup
    const heroImages = ['Contoh_masjid.jpg', 'foto_fasilitas/Contoh_DalamMasjid.jpg', 'foto_fasilitas/Contoh_Parkiran.jpg'];
    const slider = document.querySelector('.hero-slider');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;

    const updateSlider = (idx) => {
        if(!slider) return;
        slider.style.backgroundImage = `url('${heroImages[idx]}')`;
        dots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
    };

    document.getElementById('nextBtn')?.addEventListener('click', () => updateSlider(currentSlide = (currentSlide + 1) % heroImages.length));
    document.getElementById('prevBtn')?.addEventListener('click', () => updateSlider(currentSlide = (currentSlide - 1 + heroImages.length) % heroImages.length));
    updateSlider(0);

    // 2. Setup Waktu Sholat & Auto Render HTML
    const prayerTimes = [
        { name: "Subuh", time: "04:34", icon: "fa-cloud-sun" },
        { name: "Dzuhur", time: "11:39", icon: "fa-sun" },
        { name: "Ashar", time: "14:45", icon: "fa-sun-plant-wilt" },
        { name: "Maghrib", time: "17:46", icon: "fa-cloud-moon" },
        { name: "Isya", time: "18:43", icon: "fa-moon" }
    ];

    const container = document.getElementById('prayer-cards-container');
    container.innerHTML = prayerTimes.map((p, i) => `
        <div class="jadwal-card" id="card-${i}">
            <div class="prayer-icon"><i class="fa-solid ${p.icon}"></i></div>
            <span>${p.name.toUpperCase()}</span>
            <strong>${p.time}</strong>
        </div>
    `).join('');

    // Format Tanggal Dinamis
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('tanggal-sekarang').textContent = new Date().toLocaleDateString('id-ID', options);

    // 3. Countdown & Highlight
    const updateCountdown = () => {
        const now = new Date();
        const currentSeconds = (now.getHours() * 3600) + (now.getMinutes() * 60) + now.getSeconds();

        let nextIdx = prayerTimes.findIndex(p => {
            const [h, m] = p.time.split(":").map(Number);
            return (h * 3600 + m * 60) > currentSeconds;
        });

        // Jika lewat Isya, set ke Subuh besok
        let targetSeconds;
        if (nextIdx === -1) {
            nextIdx = 0;
            const [h, m] = prayerTimes[0].time.split(":").map(Number);
            targetSeconds = (h * 3600) + (m * 60) + 86400; // + 1 hari
        } else {
            const [h, m] = prayerTimes[nextIdx].time.split(":").map(Number);
            targetSeconds = (h * 3600) + (m * 60);
        }

        let diff = targetSeconds - currentSeconds;
        const h = Math.floor(diff / 3600), m = Math.floor((diff % 3600) / 60), s = diff % 60;
        const pad = n => String(n).padStart(2, '0');

        document.getElementById("next-prayer-title").textContent = `Menuju waktu ${prayerTimes[nextIdx].name}:`;
        document.getElementById("countdown-timer").textContent = `${pad(h)}j : ${pad(m)}m : ${pad(s)}d`;

        // Update CSS Highlight
        document.querySelectorAll('.jadwal-card').forEach((card, i) => {
            card.classList.toggle('active', i === nextIdx);
        });
    };

    setInterval(updateCountdown, 1000);
    updateCountdown();
});