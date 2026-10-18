// Menunggu seluruh elemen dokumen HTML selesai dimuat
document.addEventListener("DOMContentLoaded", function() {
    console.log("Website Portal Masjid Jami' Baitusy Syukur Siap!");

    // Contoh interaksi sederhana: Memberikan pesan selamat datang di konsol browser
    const masjidName = "Masjid Jami' Baitusy Syukur";
    console.log("Selamat Datang di Portal Resmi " + masjidName);
});

// Logika Slider Background Hero
const heroImages = [
    'Contoh_masjid.jpg', // Foto 1 (Ganti nama filemu)
    'foto_fasilitas/Contoh_DalamMasjid.jpg', // Foto 2
    'foto_fasilitas/Contoh_Parkiran.jpg' // Foto 3
];

let currentSlide = 0;
const heroSlider = document.querySelector('.hero-slider');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dots = document.querySelectorAll('.dot');

function updateSlider(index) {
    if (heroSlider) {
        heroSlider.style.backgroundImage = `linear-gradient(180deg, rgba(13, 84, 102, 0.6) 0%, rgba(0, 0, 0, 0.7) 100%), url('${heroImages[index]}')`;
        
        // Update titik indicator
        dots.forEach((dot, i) => {
            if (i === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
}

if (nextBtn && prevBtn) {
    nextBtn.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % heroImages.length;
        updateSlider(currentSlide);
    });

    prevBtn.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + heroImages.length) % heroImages.length;
        updateSlider(currentSlide);
    });
}

// Set tampilan awal
updateSlider(0);

document.addEventListener("DOMContentLoaded", function () {
    // 1. Data Waktu Sholat (Format 24 jam)
    const prayerTimes = [
        { name: "Subuh", time: "04:34", id: "card-subuh" },
        { name: "Dzuhur", time: "11:39", id: "card-dzuhur" },
        { name: "Ashar", time: "14:45", id: "card-ashar" },
        { name: "Maghrib", time: "17:46", id: "card-maghrib" },
        { name: "Isya", time: "18:43", id: "card-isya" }
    ];

    function updateCountdown() {
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentSeconds = now.getSeconds();

        const currentTimeInSeconds = (currentHours * 3600) + (currentMinutes * 60) + currentSeconds;

        let nextPrayer = null;
        let targetTimeInSeconds = 0;

        // Cari waktu sholat berikutnya
        for (let prayer of prayerTimes) {
            const [pHours, pMinutes] = prayer.time.split(":").map(Number);
            const pSeconds = (pHours * 3600) + (pMinutes * 60);

            if (pSeconds > currentTimeInSeconds) {
                nextPrayer = prayer;
                targetTimeInSeconds = pSeconds;
                break;
            }
        }

        // Jika semua waktu sholat hari ini sudah lewat, target berikutnya adalah Subuh besok
        if (!nextPrayer) {
            nextPrayer = prayerTimes[0];
            const [pHours, pMinutes] = nextPrayer.time.split(":").map(Number);
            targetTimeInSeconds = (pHours * 3600) + (pMinutes * 60) + (24 * 3600); // tambah 24 jam
        }

        // Hitung selisih detik
        let diffInSeconds = targetTimeInSeconds - currentTimeInSeconds;

        const hours = Math.floor(diffInSeconds / 3600);
        diffInSeconds %= 3600;
        const minutes = Math.floor(diffInSeconds / 60);
        const seconds = diffInSeconds % 60;

        // Format angka agar selalu 2 digit (misal: 05 jam)
        const formatTwoDigits = (num) => String(num).padStart(2, '0');

        // Tampilkan ke HTML
        const titleEl = document.getElementById("next-prayer-title");
        const timerEl = document.getElementById("countdown-timer");

        if (titleEl && timerEl) {
            titleEl.textContent = `Menuju waktu ${nextPrayer.name}:`;
            timerEl.textContent = `${formatTwoDigits(hours)}j : ${formatTwoDigits(minutes)}m : ${formatTwoDigits(seconds)}d`;
        }

        // Highlight kartu waktu sholat secara otomatis
        prayerTimes.forEach(p => {
            const card = document.getElementById(p.id);
            if (card) {
                if (p.name === nextPrayer.name) {
                    card.classList.add("active");
                } else {
                    card.classList.remove("active");
                }
            }
        });
    }

    // Jalankan countdown setiap 1 detik
    updateCountdown();
    setInterval(updateCountdown, 1000);
});