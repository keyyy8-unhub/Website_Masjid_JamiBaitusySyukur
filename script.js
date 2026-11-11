/**
 * Website Masjid Jami' Baitusy Syukur
 * Fitur: Kompas Penunjuk Arah Kiblat Digital & Hero Slider
 */

document.addEventListener('DOMContentLoaded', () => {
    /* ============================================================
       1. HERO SLIDER BANNER MASJID
       ============================================================ */
    initHeroSlider();

    /* ============================================================
       2. KOMPAS PENUNJUK ARAH KIBLAT DIGITAL
       ============================================================ */
    initQiblaCompass();
});

/* ================================================================
   1. IMPLEMENTASI HERO SLIDER
   ================================================================ */
function initHeroSlider() {
    const heroSlider = document.getElementById('beranda');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dots = document.querySelectorAll('.slider-dots .dot');

    if (!heroSlider) return;

    const sliderImages = [
        'foto_fasilitas/Contoh_masjid.jpg',
        'foto_fasilitas/Contoh_masjid2.jpg',
        'foto_fasilitas/Contoh_masjid3.jpg'
    ];

    let currentSlide = 0;
    let slideTimer = null;

    function showSlide(index) {
        if (index < 0) {
            currentSlide = sliderImages.length - 1;
        } else if (index >= sliderImages.length) {
            currentSlide = 0;
        } else {
            currentSlide = index;
        }

        // Ganti gambar latar hero slider
        heroSlider.style.backgroundImage = `url('${sliderImages[currentSlide]}')`;

        // Update indikator titik (dots)
        dots.forEach((dot, idx) => {
            if (idx === currentSlide) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    function startAutoSlide() {
        stopAutoSlide();
        slideTimer = setInterval(() => {
            showSlide(currentSlide + 1);
        }, 5000);
    }

    function stopAutoSlide() {
        if (slideTimer) clearInterval(slideTimer);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            showSlide(currentSlide - 1);
            startAutoSlide();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            showSlide(currentSlide + 1);
            startAutoSlide();
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            startAutoSlide();
        });
    });

    // Inisialisasi slide pertama
    showSlide(0);
    startAutoSlide();
}

/* ================================================================
   2. IMPLEMENTASI KOMPAS PENUNJUK ARAH KIBLAT
   ================================================================ */
function initQiblaCompass() {
    // Koordinat Ka'bah di Makkah Al-Mukarramah
    const KAABA_LAT = 21.422487;
    const KAABA_LNG = 39.826206;

    // Koordinat Default: Masjid Jami' Baitusy Syukur, Blotongan, Sidorejo, Kota Salatiga
    const DEFAULT_MOSQUE = {
        name: "Masjid Jami' Baitusy Syukur",
        desc: "Blotongan, Kec. Sidorejo, Kota Salatiga (7.308° S, 110.476° E)",
        lat: -7.30769,
        lng: 110.47639
    };

    // State saat ini
    let currentCoords = { lat: DEFAULT_MOSQUE.lat, lng: DEFAULT_MOSQUE.lng };
    let currentQiblaAngle = 294.6;
    let currentHeading = 0;
    let smoothedHeading = 0;
    let isSensorActive = false;
    let hasVibrated = false;

    // Elemen DOM
    const compassContainer = document.getElementById('compassContainer');
    const compassDisc = document.getElementById('compassDisc');
    const qiblaNeedleLayer = document.getElementById('qiblaNeedleLayer');
    const qiblaAlignedBanner = document.getElementById('qiblaAlignedBanner');
    const statusPulseDot = document.getElementById('statusPulseDot');
    const compassStatusDesc = document.getElementById('compassStatusDesc');

    const activeLocTitle = document.getElementById('activeLocTitle');
    const activeLocCoords = document.getElementById('activeLocCoords');
    const displayQiblaAngle = document.getElementById('displayQiblaAngle');
    const displayQiblaDistance = document.getElementById('displayQiblaDistance');
    const displayDeviceHeading = document.getElementById('displayDeviceHeading');
    const displayHeadingLabel = document.getElementById('displayHeadingLabel');

    const btnCompassSensor = document.getElementById('btnCompassSensor');
    const btnSensorLabel = document.getElementById('btnSensorLabel');
    const btnUseGPS = document.getElementById('btnUseGPS');
    const btnResetMosque = document.getElementById('btnResetMosque');

    const compassRangeSlider = document.getElementById('compassRangeSlider');
    const sliderValDisplay = document.getElementById('sliderValDisplay');

    if (!compassContainer || !compassDisc) return;

    /* ------------------------------------------------------------
       Perhitungan Trigonometri Arah Kiblat (Great Circle Bearing)
       ------------------------------------------------------------ */
    function calculateQiblaBearing(lat, lng) {
        const toRad = deg => (deg * Math.PI) / 180;
        const toDeg = rad => (rad * 180) / Math.PI;

        const phi1 = toRad(lat);
        const lambda1 = toRad(lng);
        const phi2 = toRad(KAABA_LAT);
        const lambda2 = toRad(KAABA_LNG);

        const dLambda = lambda2 - lambda1;
        const y = Math.sin(dLambda);
        const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(dLambda);

        let bearing = toDeg(Math.atan2(y, x));
        return (bearing + 360) % 360;
    }

    /* ------------------------------------------------------------
       Perhitungan Jarak Great-Circle ke Ka'bah (Formula Haversine)
       ------------------------------------------------------------ */
    function calculateDistanceToKaaba(lat, lng) {
        const toRad = deg => (deg * Math.PI) / 180;
        const R = 6371; // Jari-jari bumi dalam km

        const dLat = toRad(KAABA_LAT - lat);
        const dLng = toRad(KAABA_LNG - lng);
        const a = Math.sin(dLat / 2) ** 2 +
                  Math.cos(toRad(lat)) * Math.cos(toRad(KAABA_LAT)) *
                  Math.sin(dLng / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
    }

    /* ------------------------------------------------------------
       Konversi Derajat ke Nama Arah Mata Angin
       ------------------------------------------------------------ */
    function getDirectionName(deg) {
        const directions = [
            'Utara', 'Utara Timur Laut', 'Timur Laut', 'Timur Menenggara',
            'Timur', 'Tenggara Menimur', 'Tenggara', 'Selatan Menenggara',
            'Selatan', 'Selatan Menbarat', 'Barat Daya', 'Barat Membarat Daya',
            'Barat', 'Barat Menghadap Laut', 'Barat Laut', 'Utara Barat Laut'
        ];
        const index = Math.round(deg / 22.5) % 16;
        return directions[index];
    }

    /* ------------------------------------------------------------
       Update Tampilan Kiblat & Metrik
       ------------------------------------------------------------ */
    function updateQiblaMetrics() {
        currentQiblaAngle = calculateQiblaBearing(currentCoords.lat, currentCoords.lng);
        const distance = calculateDistanceToKaaba(currentCoords.lat, currentCoords.lng);

        if (displayQiblaAngle) {
            displayQiblaAngle.textContent = `${currentQiblaAngle.toFixed(1)}°`;
        }

        if (displayQiblaDistance) {
            displayQiblaDistance.textContent = distance.toLocaleString('id-ID');
        }

        // Posisikan jarum/ikon Ka'bah pada piringan kompas
        if (qiblaNeedleLayer) {
            qiblaNeedleLayer.style.transform = `rotate(${currentQiblaAngle}deg)`;
        }

        // Perbarui rotasi kompas terhadap heading saat ini
        updateCompassRotation(currentHeading);
    }

    /* ------------------------------------------------------------
       Rotasi Piringan Kompas & Pengecekan Kesejajaran (Alignment)
       ------------------------------------------------------------ */
    function updateCompassRotation(heading) {
        currentHeading = (heading + 360) % 360;

        // Piringan kompas berputar berlawanan dengan arah hadap (-heading)
        // sehingga tanda Utara (U) selalu menunjuk ke arah Utara sebenarnya
        compassDisc.style.transform = `rotate(${-currentHeading}deg)`;

        // Update teks arah hadap
        if (displayDeviceHeading) {
            displayDeviceHeading.textContent = `${Math.round(currentHeading)}°`;
        }

        // Selisih antara arah hadap perangkat dengan arah kiblat
        let diff = Math.abs((currentHeading - currentQiblaAngle + 540) % 360 - 180);
        const isAligned = diff <= 4.0; // Toleransi ±4 derajat untuk akurasi optimal

        if (displayHeadingLabel) {
            if (isAligned) {
                displayHeadingLabel.textContent = "Tepat Kiblat! 🕋";
                displayHeadingLabel.style.color = "#10B981";
                displayHeadingLabel.style.fontWeight = "700";
            } else {
                displayHeadingLabel.textContent = getDirectionName(currentHeading);
                displayHeadingLabel.style.color = "";
                displayHeadingLabel.style.fontWeight = "";
            }
        }

        if (isAligned) {
            compassContainer.classList.add('aligned');
            if (!hasVibrated && navigator.vibrate) {
                try {
                    navigator.vibrate(60);
                } catch (e) {}
                hasVibrated = true;
            }
        } else {
            compassContainer.classList.remove('aligned');
            hasVibrated = false;
        }
    }

    /* ------------------------------------------------------------
       Handler Sensor Orientasi Ponsel (Gyroscope / Magnetometer)
       ------------------------------------------------------------ */
    function handleOrientation(event) {
        let heading = null;

        // 1. Prioritas untuk perangkat iOS Safari
        if (typeof event.webkitCompassHeading !== 'undefined' && event.webkitCompassHeading !== null) {
            heading = event.webkitCompassHeading;
        }
        // 2. Android dengan Absolute Orientation
        else if (event.absolute === true && event.alpha !== null) {
            heading = (360 - event.alpha) % 360;
        }
        // 3. Fallback alpha standar
        else if (event.alpha !== null) {
            heading = (360 - event.alpha) % 360;
        }

        if (heading !== null) {
            // Filter perhalus sudut agar jarum tidak bergetar (low-pass smoothing)
            let diff = (heading - smoothedHeading + 540) % 360 - 180;
            smoothedHeading += diff * 0.35;
            smoothedHeading = (smoothedHeading + 360) % 360;

            updateCompassRotation(smoothedHeading);

            // Sinkronkan slider simulasi
            if (compassRangeSlider) {
                compassRangeSlider.value = Math.round(smoothedHeading);
                if (sliderValDisplay) {
                    sliderValDisplay.textContent = `${Math.round(smoothedHeading)}° (${getDirectionName(smoothedHeading)})`;
                }
            }
        }
    }

    function startCompassSensor() {
        // Cek dukungan requestPermission pada iOS 13+
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(response => {
                    if (response === 'granted') {
                        attachOrientationListeners();
                    } else {
                        alert('Izin sensor gerak tidak diberikan. Anda tetap bisa menggunakan simulasi putar arah.');
                    }
                })
                .catch(err => {
                    console.warn('Error requestPermission:', err);
                    attachOrientationListeners();
                });
        } else {
            // Android dan browser modern standar
            attachOrientationListeners();
        }
    }

    function attachOrientationListeners() {
        window.addEventListener('deviceorientationabsolute', handleOrientation, true);
        window.addEventListener('deviceorientation', handleOrientation, true);

        isSensorActive = true;
        if (btnCompassSensor) btnCompassSensor.classList.add('active');
        if (btnSensorLabel) btnSensorLabel.textContent = "Nonaktifkan Sensor Gerak";
        if (statusPulseDot) statusPulseDot.classList.add('active');
        if (compassStatusDesc) compassStatusDesc.textContent = "Sensor Kompas HP Aktif (Real-time)";
    }

    function stopCompassSensor() {
        window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
        window.removeEventListener('deviceorientation', handleOrientation, true);

        isSensorActive = false;
        if (btnCompassSensor) btnCompassSensor.classList.remove('active');
        if (btnSensorLabel) btnSensorLabel.textContent = "Aktifkan Sensor Kompas HP";
        if (statusPulseDot) statusPulseDot.classList.remove('active');
        if (compassStatusDesc) compassStatusDesc.textContent = "Mode Kompas Statis (Arah Utara)";
    }

    if (btnCompassSensor) {
        btnCompassSensor.addEventListener('click', () => {
            if (isSensorActive) {
                stopCompassSensor();
            } else {
                startCompassSensor();
            }
        });
    }

    /* ------------------------------------------------------------
       Handler Lokasi GPS Pengguna
       ------------------------------------------------------------ */
    if (btnUseGPS) {
        btnUseGPS.addEventListener('click', () => {
            if (!navigator.geolocation) {
                alert('Browser Anda tidak mendukung deteksi lokasi otomatis (Geolocation).');
                return;
            }

            btnUseGPS.disabled = true;
            btnUseGPS.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mendeteksi Lokasi...';

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    btnUseGPS.disabled = false;
                    btnUseGPS.innerHTML = '<i class="fa-solid fa-crosshairs"></i> Deteksi Lokasi GPS Saya';

                    currentCoords = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    if (activeLocTitle) activeLocTitle.textContent = "Lokasi GPS Anda Saat Ini";
                    if (activeLocCoords) {
                        const latFormatted = Math.abs(currentCoords.lat).toFixed(3) + (currentCoords.lat < 0 ? '° S' : '° N');
                        const lngFormatted = Math.abs(currentCoords.lng).toFixed(3) + (currentCoords.lng < 0 ? '° W' : '° E');
                        activeLocCoords.textContent = `Koordinat: ${latFormatted}, ${lngFormatted}`;
                    }

                    if (btnResetMosque) btnResetMosque.style.display = 'inline-flex';

                    updateQiblaMetrics();
                },
                (error) => {
                    btnUseGPS.disabled = false;
                    btnUseGPS.innerHTML = '<i class="fa-solid fa-crosshairs"></i> Deteksi Lokasi GPS Saya';

                    let msg = 'Tidak dapat mengakses lokasi GPS.';
                    if (error.code === 1) msg = 'Izin akses lokasi ditolak oleh pengguna.';
                    else if (error.code === 2) msg = 'Posisi lokasi GPS tidak dapat ditentukan.';
                    else if (error.code === 3) msg = 'Waktu permintaan lokasi habis.';

                    alert(`${msg}\nMenampilkan arah kiblat patokan Masjid Jami' Baitusy Syukur Salatiga.`);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        });
    }

    /* ------------------------------------------------------------
       Tombol Reset ke Koordinat Masjid Salatiga
       ------------------------------------------------------------ */
    if (btnResetMosque) {
        btnResetMosque.addEventListener('click', () => {
            currentCoords = { lat: DEFAULT_MOSQUE.lat, lng: DEFAULT_MOSQUE.lng };

            if (activeLocTitle) activeLocTitle.textContent = DEFAULT_MOSQUE.name;
            if (activeLocCoords) activeLocCoords.textContent = DEFAULT_MOSQUE.desc;

            btnResetMosque.style.display = 'none';
            updateQiblaMetrics();
        });
    }

    /* ------------------------------------------------------------
       Slider Simulasi Putar Manual (Desktop / Laptop / Manual Test)
       ------------------------------------------------------------ */
    if (compassRangeSlider) {
        compassRangeSlider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if (sliderValDisplay) {
                sliderValDisplay.textContent = `${Math.round(val)}° (${getDirectionName(val)})`;
            }

            // Jika sensor sedang aktif, nonaktifkan agar simulasi manual bisa dijalankan
            if (isSensorActive) {
                stopCompassSensor();
            }

            updateCompassRotation(val);
        });
    }

    // Inisialisasi awal nilai kiblat
    updateQiblaMetrics();
}
