import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, Linking, FlatList, Alert,
  Dimensions, Share, Modal, StatusBar, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ilanDetayGetir, ilanlarGetir,
  favoriEkle, favoriSil, favoriKontrol,
  kayitliAdreslerGetir, mesajGonder,
} from '../services/api';

const { width, height } = Dimensions.get('window');
const FALLBACK = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80';

const fiyatFormat = (f) =>
  new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(f) + ' TL';

const tarihFormat = (t) => {
  if (!t) return null;
  const d = new Date(t);
  const aylar = ['OCAK','ŞUBAT','MART','NİSAN','MAYIS','HAZİRAN','TEMMUZ','AĞUSTOS','EYLÜL','EKİM','KASIM','ARALIK'];
  return `${d.getDate()} ${aylar[d.getMonth()]} ${d.getFullYear()}`;
};

const turKategori = (t) => {
  if (!t) return null;
  if (['Daire','Villa','Müstakil Ev'].includes(t)) return 'KONUT';
  if (t === 'Arsa') return 'ARSA';
  if (['İşyeri','Depo'].includes(t)) return 'İŞYERİ';
  return t.toUpperCase();
};

const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
};

const BilgiSatir = ({ label, value, son }) => (
  <View style={[s.bilgiSatir, son && { borderBottomWidth: 0 }]}>
    <Text style={s.bilgiLabel}>{label}</Text>
    <Text style={s.bilgiValue}>{String(value).toUpperCase()}</Text>
  </View>
);

const MiniIlanKart = ({ item, onPress }) => {
  const gorsel = (Array.isArray(item.fotograflar) && item.fotograflar[0]) || item.gorsel || FALLBACK;
  return (
    <TouchableOpacity style={s.miniKart} onPress={onPress} activeOpacity={0.85}>
      <Image source={{ uri: gorsel }} style={s.miniGorsel} resizeMode="cover" />
      <View style={[s.miniTip, { backgroundColor: item.tip === 'Kiralık' ? '#3b82f6' : '#16a34a' }]}>
        <Text style={s.miniTipText}>{item.tip}</Text>
      </View>
      <View style={s.miniAlt}>
        <Text style={s.miniFiyat}>{fiyatFormat(item.fiyat)}</Text>
        <Text style={s.miniBaslik} numberOfLines={1}>{item.baslik}</Text>
        {item.metrekare ? <Text style={s.miniMeta}>{item.metrekare} m²</Text> : null}
      </View>
    </TouchableOpacity>
  );
};

export default function IlanDetayScreen({ route, navigation }) {
  const { id } = route.params;
  const [ilan, setIlan]               = useState(null);
  const [yukleniyor, setYukleniyor]   = useState(true);
  const [aciklamaAcik, setAciklamaAcik] = useState(false);
  const [bilgiAcik, setBilgiAcik]     = useState(false);
  const [aktifFoto, setAktifFoto]     = useState(0);
  const [favori, setFavori]           = useState(false);
  const [lightboxAcik, setLightboxAcik] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [emlakciilanlar, setEmlakciilanlar] = useState([]);
  const [benzerilanlar, setBenzerilanlar]   = useState([]);
  const [adresler, setAdresler]             = useState([]);
  const [benimId, setBenimId]               = useState(null);
  const flatRef     = useRef(null);
  const lightboxRef = useRef(null);

  useEffect(() => {
    ilanDetayGetir(id)
      .then(r => {
        const veri = r.data.ilan || r.data;
        setIlan(veri);
        // Emlakçının diğer ilanları
        if (veri.dukkan_id) {
          ilanlarGetir({ dukkan_id: veri.dukkan_id, limit: 10 })
            .then(r2 => setEmlakciilanlar((r2.data.ilanlar || []).filter(i => i.id !== veri.id)))
            .catch(() => {});
        }
        // Benzer ilanlar
        ilanlarGetir({ tip: veri.tip, sehir: veri.sehir, limit: 10 })
          .then(r3 => setBenzerilanlar((r3.data.ilanlar || []).filter(i => i.id !== veri.id).slice(0, 6)))
          .catch(() => {});
      })
      .catch(() => setIlan(null))
      .finally(() => setYukleniyor(false));

    // Favori kontrolü + benim id
    AsyncStorage.getItem('token').then(token => {
      if (!token) return;
      favoriKontrol(id).then(r => setFavori(r.data.favori || false)).catch(() => {});
    });
    AsyncStorage.getItem('kullanici').then(v => { if (v) setBenimId(JSON.parse(v).id); });

    // Kayıtlı adresler
    AsyncStorage.getItem('token').then(token => {
      if (!token) return;
      kayitliAdreslerGetir().then(r => setAdresler(r.data.adresler || [])).catch(() => {});
    });
  }, [id]);

  const favoriToggle = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) { navigation.navigate('Giris'); return; }
    try {
      if (favori) { await favoriSil(id); setFavori(false); }
      else        { await favoriEkle(id); setFavori(true); }
    } catch {}
  };

  if (yukleniyor) {
    return <View style={s.merkez}><ActivityIndicator size="large" color="#16a34a" /></View>;
  }

  if (!ilan) {
    return (
      <View style={s.merkez}>
        <Ionicons name="alert-circle-outline" size={48} color="#d1d5db" />
        <Text style={s.bosText}>İlan bulunamadı</Text>
        <TouchableOpacity style={s.geriBtn2} onPress={() => navigation.goBack()}>
          <Text style={s.geriBtn2Text}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fotograflar = Array.isArray(ilan.fotograflar) && ilan.fotograflar.length > 0
    ? ilan.fotograflar
    : ilan.gorsel ? [ilan.gorsel] : [FALLBACK];

  const konumKisa = [ilan.sehir, ilan.ilce, ilan.mahalle].filter(Boolean).join(' / ');
  const paylasma = () => Share.share({ message: `${ilan.baslik} - ${fiyatFormat(ilan.fiyat)}\n${konumKisa}` });

  const bilgiler = [
    { label: 'İlan Numarası',      value: ilan.id },
    { label: 'Görüntülenme',       value: ilan.goruntuleme_sayisi > 0 ? `${Number(ilan.goruntuleme_sayisi).toLocaleString('tr-TR')} kez` : null },
    { label: 'İlan Tarihi',        value: tarihFormat(ilan.olusturulma_tarihi) },
    { label: 'Türü',               value: turKategori(ilan.emlak_turu) },
    { label: 'Kategorisi',         value: ilan.tip },
    { label: 'Tipi',               value: ilan.emlak_turu },
    { label: 'Metrekare',          value: ilan.metrekare ? `${ilan.metrekare} m²` : null },
    { label: 'Oda Sayısı',         value: ilan.oda_sayisi },
    { label: 'Binanın Yaşı',       value: ilan.bina_yasi != null ? (ilan.bina_yasi === 0 ? 'Sıfır Bina' : `${ilan.bina_yasi} Yıl`) : null },
    { label: 'Bulunduğu Kat',      value: ilan.kat ? `${ilan.kat}. Kat` : null },
    { label: 'Binanın Kat Sayısı', value: ilan.toplam_kat },
    { label: 'Isıtma Tipi',        value: ilan.isinma_tipi },
    { label: 'Banyo Sayısı',       value: ilan.banyo_sayisi },
    { label: 'Krediye Uygunluk',   value: ilan.krediye_uygunluk === true ? 'Krediye Uygun' : ilan.krediye_uygunluk === false ? 'Krediye Uygun Değil' : null },
    { label: 'Takas',              value: ilan.takas === true ? 'Var' : ilan.takas === false ? 'Yok' : null },
    { label: 'Balkon',             value: ilan.balkon ? 'Var' : null },
    { label: 'Asansör',            value: ilan.asansor ? 'Var' : null },
    { label: 'Otopark',            value: ilan.otopark ? 'Var' : null },
    { label: 'Eşyalı',            value: ilan.esyali ? 'Evet' : null },
    { label: 'Site İçinde',        value: ilan.site_icerisinde ? 'Evet' : null },
  ].filter(b => b.value != null && b.value !== '');

  const gorunenBilgiler = bilgiAcik ? bilgiler : bilgiler.slice(0, 7);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>

      {/* LIGHTBOX */}
      <Modal visible={lightboxAcik} transparent={false} animationType="fade" onRequestClose={() => setLightboxAcik(false)}>
        <StatusBar backgroundColor="#000" barStyle="light-content" />
        <View style={s.lightboxKap}>
          <FlatList
            ref={lightboxRef}
            data={fotograflar}
            horizontal pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => `lb-${i}`}
            onMomentumScrollEnd={e => setLightboxIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={{ width, height }} resizeMode="contain" />
            )}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          />
          <TouchableOpacity style={s.lbKapat} onPress={() => setLightboxAcik(false)}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {lightboxIndex > 0 && (
            <TouchableOpacity style={s.lbOkSol} onPress={() => {
              const y = lightboxIndex - 1; setLightboxIndex(y);
              lightboxRef.current?.scrollToIndex({ index: y, animated: true });
            }}>
              <Ionicons name="chevron-back" size={32} color="#fff" />
            </TouchableOpacity>
          )}
          {lightboxIndex < fotograflar.length - 1 && (
            <TouchableOpacity style={s.lbOkSag} onPress={() => {
              const y = lightboxIndex + 1; setLightboxIndex(y);
              lightboxRef.current?.scrollToIndex({ index: y, animated: true });
            }}>
              <Ionicons name="chevron-forward" size={32} color="#fff" />
            </TouchableOpacity>
          )}
          <View style={s.lbSayac}>
            <Text style={s.lbSayacText}>{lightboxIndex + 1} / {fotograflar.length}</Text>
          </View>
        </View>
      </Modal>

      {/* HEADER */}
      <SafeAreaView style={s.headerSafe}>
        <View style={s.header}>
          <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={26} color="#111827" />
          </TouchableOpacity>
          <Text style={s.headerBaslik}>İlan Detayları</Text>
          <View style={s.headerSag}>
            <TouchableOpacity style={s.headerBtn} onPress={favoriToggle}>
              <Ionicons name={favori ? 'heart' : 'heart-outline'} size={24} color={favori ? '#ef4444' : '#111827'} />
            </TouchableOpacity>
            <TouchableOpacity style={[s.headerBtn, { marginLeft: 4 }]} onPress={paylasma}>
              <Ionicons name="share-social-outline" size={23} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* BAŞLIK */}
        <View style={s.baslikWrap}>
          <Text style={s.baslik}>{ilan.baslik}</Text>
        </View>

        {/* CAROUSEL */}
        <View style={s.carouselWrap}>
          <FlatList
            ref={flatRef}
            data={fotograflar}
            horizontal pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            onMomentumScrollEnd={e => setAktifFoto(Math.round(e.nativeEvent.contentOffset.x / width))}
            renderItem={({ item, index }) => (
              <TouchableOpacity activeOpacity={0.95} onPress={() => {
                setLightboxIndex(index); setLightboxAcik(true);
                setTimeout(() => lightboxRef.current?.scrollToIndex({ index, animated: false }), 50);
              }}>
                <Image source={{ uri: item }} style={s.carouselGorsel} resizeMode="cover" />
              </TouchableOpacity>
            )}
          />
          {aktifFoto > 0 && (
            <TouchableOpacity style={s.carOkSol} onPress={() => {
              const y = aktifFoto - 1; setAktifFoto(y);
              flatRef.current?.scrollToIndex({ index: y, animated: true });
            }}>
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
          )}
          {aktifFoto < fotograflar.length - 1 && (
            <TouchableOpacity style={s.carOkSag} onPress={() => {
              const y = aktifFoto + 1; setAktifFoto(y);
              flatRef.current?.scrollToIndex({ index: y, animated: true });
            }}>
              <Ionicons name="chevron-forward" size={28} color="#fff" />
            </TouchableOpacity>
          )}
          <View style={s.sayac}>
            <Text style={s.sayacText}>{aktifFoto + 1} / {fotograflar.length}</Text>
          </View>
        </View>

        {/* FİYAT / ÖZET / KONUM */}
        <View style={s.fiyatWrap}>
          <View style={s.tipRow}>
            <View style={[s.ilanTipBadge, { backgroundColor: ilan.tip === 'Kiralık' ? '#3b82f6' : '#16a34a' }]}>
              <Text style={s.ilanTipText}>{ilan.tip || 'Satılık'}</Text>
            </View>
            {ilan.emlak_turu ? (
              <View style={s.ilanTurBadge}>
                <Text style={s.ilanTurText}>{ilan.emlak_turu}</Text>
              </View>
            ) : null}
            {ilan.goruntuleme_sayisi > 0 ? (
              <View style={s.goruntulemeChip}>
                <Ionicons name="eye-outline" size={12} color="#9ca3af" />
                <Text style={s.goruntulemeText}>{Number(ilan.goruntuleme_sayisi).toLocaleString('tr-TR')} görüntüleme</Text>
              </View>
            ) : null}
          </View>
          <Text style={s.fiyat}>{fiyatFormat(ilan.fiyat)}</Text>
          <View style={s.chipRow}>
            {ilan.oda_sayisi ? <Text style={s.chip}>{ilan.oda_sayisi}</Text> : null}
            {ilan.oda_sayisi && ilan.kat ? <Text style={s.chipAyrac}>|</Text> : null}
            {ilan.kat ? <Text style={s.chip}>{ilan.kat}. Kat</Text> : null}
            {ilan.metrekare ? (
              <>
                {(ilan.oda_sayisi || ilan.kat) ? <Text style={s.chipAyrac}>|</Text> : null}
                <Text style={s.chip}>{ilan.metrekare} m²</Text>
              </>
            ) : null}
          </View>
          {konumKisa ? (
            <View style={s.konumRow}>
              <Ionicons name="location" size={14} color="#16a34a" />
              <Text style={s.konumText}>{konumKisa}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Harita', { ilanlar: [ilan] })}>
                <Text style={s.konumGor}>Konumunu Gör</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {/* İLAN BİLGİLERİ */}
        <View style={s.bolum}>
          <Text style={s.bolumBaslik}>İLAN BİLGİLERİ</Text>
          {gorunenBilgiler.map((b, i) => (
            <BilgiSatir key={i} label={b.label} value={b.value} son={i === gorunenBilgiler.length - 1} />
          ))}
          {bilgiler.length > 7 ? (
            <TouchableOpacity style={s.devamiBtn} onPress={() => setBilgiAcik(!bilgiAcik)}>
              <Text style={s.devamiText}>{bilgiAcik ? 'Daha Az Gör' : 'Devamını Gör'}</Text>
              <Ionicons name={bilgiAcik ? 'chevron-up' : 'chevron-down'} size={16} color="#16a34a" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* İLAN AÇIKLAMASI */}
        {ilan.aciklama ? (
          <View style={s.bolum}>
            <Text style={s.bolumBaslik}>İLAN AÇIKLAMASI</Text>
            <Text style={s.aciklamaText} numberOfLines={aciklamaAcik ? undefined : 5}>
              {ilan.aciklama}
            </Text>
            <TouchableOpacity style={s.devamiBtn} onPress={() => setAciklamaAcik(!aciklamaAcik)}>
              <Text style={s.devamiText}>{aciklamaAcik ? 'Daha Az Gör' : 'Devamını Gör'}</Text>
              <Ionicons name={aciklamaAcik ? 'chevron-up' : 'chevron-down'} size={16} color="#16a34a" />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* ADRESE UZAKLIĞI */}
        <View style={s.bolum}>
          <Text style={s.bolumBaslik}>ADRESE UZAKLIĞI</Text>
          {adresler.length === 0 ? (
            <View style={s.adresBos}>
              <Text style={s.adresBosText}>Adreslerinizi ekleyerek, adresinizin ilan konumuna olan uzaklığını görebilirsiniz.</Text>
              <TouchableOpacity style={s.adresEkleBtn} onPress={() => navigation.navigate('KayitliAdresler')}>
                <Ionicons name="add" size={16} color="#16a34a" />
                <Text style={s.adresEkleBtnText}>Adres Ekle</Text>
              </TouchableOpacity>
            </View>
          ) : (
            adresler.map(adres => {
              const mesafe = (ilan.enlem && ilan.boylam && adres.enlem && adres.boylam)
                ? `${haversine(parseFloat(ilan.enlem), parseFloat(ilan.boylam), parseFloat(adres.enlem), parseFloat(adres.boylam))} km`
                : '- km';
              return (
                <View key={adres.id} style={s.adresKart}>
                  <Ionicons name="location-outline" size={18} color="#16a34a" />
                  <View style={{ flex: 1 }}>
                    <Text style={s.adresBaslik}>{adres.baslik}</Text>
                    {adres.sehir ? <Text style={s.adresAlt}>{[adres.ilce, adres.sehir].filter(Boolean).join(', ')}</Text> : null}
                  </View>
                  <View style={s.mesafeKutu}>
                    <Ionicons name="navigate-outline" size={14} color="#6b7280" />
                    <Text style={s.mesafeText}>{mesafe}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* EMLAKÇI KÜNYESİ */}
        {ilan.dukkan_adi ? (
          <View style={s.bolum}>
            <Text style={s.bolumBaslik}>EMLAKÇI KÜNYESİ</Text>
            <View style={s.emlakciKart}>
              <View style={s.emlakciLogo}>
                <Text style={s.emlakciLogoText}>
                  {ilan.dukkan_adi.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={s.emlakciAd}>{ilan.dukkan_adi}</Text>
                {(ilan.dukkan_sehir || ilan.dukkan_ilce) ? (
                  <Text style={s.emlakciKonum}>{[ilan.dukkan_ilce, ilan.dukkan_sehir].filter(Boolean).join(' - ')}</Text>
                ) : null}
                {ilan.vergi_no ? (
                  <Text style={s.emlakciVergi}>Vergi No: {ilan.vergi_no}</Text>
                ) : null}
              </View>
              <View style={s.emlakciBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#16a34a" />
                <Text style={s.emlakciBadgeText}>Yetkili</Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* EMLAKÇININ DİĞER İLANLARI */}
        {emlakciilanlar.length > 0 ? (
          <View style={s.yatayBolum}>
            <View style={s.yatayBaslikRow}>
              <Text style={s.bolumBaslik}>EMLAKÇININ DİĞER İLANLARI</Text>
              <TouchableOpacity onPress={() => navigation.navigate('TumIlanlar', { dukkan_id: ilan.dukkan_id, baslik: ilan.dukkan_adi })}>
                <Text style={s.tumunuGor}>Tümünü Gör</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={emlakciilanlar}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={i => `emlakci-${i.id}`}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
              renderItem={({ item }) => (
                <MiniIlanKart item={item} onPress={() => navigation.navigate('IlanDetay', { id: item.id })} />
              )}
            />
          </View>
        ) : null}

        {/* BENZER İLANLAR */}
        {benzerilanlar.length > 0 ? (
          <View style={s.yatayBolum}>
            <View style={s.yatayBaslikRow}>
              <Text style={s.bolumBaslik}>BENZER İLANLAR</Text>
            </View>
            <FlatList
              data={benzerilanlar}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={i => `benzer-${i.id}`}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
              renderItem={({ item }) => (
                <MiniIlanKart item={item} onPress={() => navigation.navigate('IlanDetay', { id: item.id })} />
              )}
            />
          </View>
        ) : null}

        {/* HATALI İLAN BİLDİR */}
        <View style={s.bildir}>
          <Text style={s.bildirText}>İlanla ilgili şikayetlerinizi bize bildirebilirsiniz</Text>
          <TouchableOpacity style={s.bildirBtn} onPress={() =>
            Alert.alert(
              'Hatalı İlan Bildir',
              'Bu ilanı şüpheli veya hatalı buluyorsanız destek ekibimize bildirebilirsiniz.',
              [
                { text: 'İptal', style: 'cancel' },
                { text: 'Bildir', style: 'destructive', onPress: () =>
                    Alert.alert('Bildiriminiz Alındı', 'Teşekkürler! Ekibimiz en kısa sürede inceleyecektir.')
                },
              ]
            )
          }>
            <Ionicons name="flag-outline" size={15} color="#ef4444" />
            <Text style={s.bildirBtnText}>Hatalı İlan Bildir</Text>
          </TouchableOpacity>
        </View>

        {/* GÜVENLİK ÖNERİLERİ */}
        <View style={s.guvenlik}>
          <Text style={s.guvenlikBaslik}>GÜVENLİK ÖNERİLERİ</Text>
          <Text style={s.guvenlikText}>
            Gayrimenkulu görmeden, hiçbir sebeple kapora ve benzeri bir ödeme gerçekleştirmeyin.
          </Text>
          <Text style={s.guvenlikText}>
            Şüphe duyduğunuz ilanları lütfen bize bildirin.
          </Text>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ALT BAR */}
      <View style={s.altBar}>
        <TouchableOpacity
          style={s.whatsappBtn}
          onPress={() => {
            const tel = ilan.sahip_telefon?.replace(/\D/g, '') || '';
            const wa  = tel.startsWith('0') ? '9' + tel.slice(1) : tel || '905001234567';
            Linking.openURL(`https://wa.me/${wa}`);
          }}
        >
          <Ionicons name="logo-whatsapp" size={26} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={s.mesajBtn}
          onPress={async () => {
            const token = await AsyncStorage.getItem('token');
            if (!token) { navigation.navigate('Giris'); return; }
            if (parseInt(benimId) === parseInt(ilan.kullanici_id)) return;
            try {
              const r = await mesajGonder({
                alici_id: ilan.kullanici_id,
                ilan_id: ilan.id,
                metin: `Merhaba, "${ilan.baslik}" ilanınızla ilgileniyorum.`,
              });
              navigation.navigate('Konusma', {
                konusmaId: r.data.konusma_id,
                karsiAd: ilan.dukkan_adi || 'İlan Sahibi',
                ilanBaslik: ilan.baslik,
                karsiId: ilan.kullanici_id,
              });
            } catch { navigation.navigate('Mesajlar'); }
          }}
        >
          <Text style={s.mesajBtnText}>Mesaj At</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.araBtn}
          onPress={() => Linking.openURL(`tel:${ilan.sahip_telefon || '05001234567'}`)}
        >
          <Text style={s.araBtnText}>Ara</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  merkez:   { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  bosText:  { fontSize: 16, color: '#6b7280', fontWeight: '600' },
  geriBtn2: { backgroundColor: '#16a34a', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 },
  geriBtn2Text: { color: '#fff', fontWeight: '700' },

  // Lightbox
  lightboxKap: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  lbKapat:  { position: 'absolute', top: 50, right: 16, width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  lbOkSol:  { position: 'absolute', left: 10, top: '50%', marginTop: -24, width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  lbOkSag:  { position: 'absolute', right: 10, top: '50%', marginTop: -24, width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  lbSayac:  { position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  lbSayacText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // Header
  headerSafe:   { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 10, backgroundColor: '#fff' },
  headerBtn:    { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerBaslik: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#111827' },
  headerSag:    { flexDirection: 'row', alignItems: 'center' },

  // Başlık
  baslikWrap: { backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  baslik:     { fontSize: 14, fontWeight: '700', color: '#111827', lineHeight: 20, textTransform: 'uppercase' },

  // Carousel
  carouselWrap:   { position: 'relative', height: 270 },
  carouselGorsel: { width, height: 270 },
  carOkSol: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.25)' },
  carOkSag: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.25)' },
  sayac:    { position: 'absolute', bottom: 10, right: 12, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  sayacText:{ color: '#fff', fontSize: 12, fontWeight: '700' },

  // Fiyat
  fiyatWrap: { backgroundColor: '#fff', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 8, borderBottomColor: '#f5f5f5' },
  tipRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  ilanTipBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  ilanTipText:  { color: '#fff', fontSize: 12, fontWeight: '700' },
  ilanTurBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: '#f5f5f5' },
  ilanTurText:  { color: '#374151', fontSize: 12, fontWeight: '600' },
  goruntulemeChip: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' },
  goruntulemeText: { fontSize: 12, color: '#9ca3af' },
  fiyat:    { fontSize: 28, fontWeight: '900', color: '#111827', marginTop: 8 },
  chipRow:  { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  chip:     { fontSize: 14, fontWeight: '600', color: '#374151' },
  chipAyrac:{ fontSize: 14, color: '#d1d5db', marginHorizontal: 8 },
  konumRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 },
  konumText:{ flex: 1, fontSize: 13, color: '#6b7280' },
  konumGor: { fontSize: 13, fontWeight: '700', color: '#16a34a' },

  // Bölüm
  bolum:      { backgroundColor: '#fff', borderBottomWidth: 8, borderBottomColor: '#f5f5f5', paddingHorizontal: 16, paddingVertical: 16 },
  bolumBaslik:{ fontSize: 12, fontWeight: '800', color: '#9ca3af', letterSpacing: 1, marginBottom: 12 },
  bilgiSatir: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  bilgiLabel: { fontSize: 14, color: '#6b7280' },
  bilgiValue: { fontSize: 14, fontWeight: '800', color: '#111827', textAlign: 'right', flex: 1, marginLeft: 16 },
  devamiBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 14 },
  devamiText: { fontSize: 14, fontWeight: '700', color: '#16a34a' },
  aciklamaText:{ fontSize: 14, color: '#374151', lineHeight: 24 },

  // Adrese Uzaklığı
  adresBos:     { gap: 10 },
  adresBosText: { fontSize: 13, color: '#6b7280', lineHeight: 20 },
  adresEkleBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderWidth: 1.5, borderColor: '#16a34a', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  adresEkleBtnText: { fontSize: 13, fontWeight: '700', color: '#16a34a' },
  adresKart:    { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  adresBaslik:  { fontSize: 14, fontWeight: '700', color: '#111827' },
  adresAlt:     { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  mesafeKutu:   { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f5f5f5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  mesafeText:   { fontSize: 13, fontWeight: '700', color: '#374151' },

  // Emlakçı
  emlakciKart:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emlakciLogo:     { width: 54, height: 54, borderRadius: 12, backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', justifyContent: 'center', alignItems: 'center' },
  emlakciLogoText: { fontSize: 18, fontWeight: '900', color: '#16a34a' },
  emlakciAd:       { fontSize: 15, fontWeight: '800', color: '#111827' },
  emlakciKonum:    { fontSize: 12, color: '#6b7280' },
  emlakciVergi:    { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  emlakciBadge:    { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  emlakciBadgeText:{ fontSize: 11, fontWeight: '700', color: '#16a34a' },

  // Yatay bölüm (diğer/benzer ilanlar)
  yatayBolum:     { backgroundColor: '#fff', borderBottomWidth: 8, borderBottomColor: '#f5f5f5', paddingVertical: 16 },
  yatayBaslikRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  tumunuGor:      { fontSize: 13, fontWeight: '700', color: '#16a34a' },

  // Mini ilan kartı
  miniKart:   { width: 160, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#f0f0f0', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4 },
  miniGorsel: { width: 160, height: 110 },
  miniTip:    { position: 'absolute', top: 8, left: 8, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  miniTipText:{ color: '#fff', fontSize: 10, fontWeight: '700' },
  miniAlt:    { padding: 10, gap: 3 },
  miniFiyat:  { fontSize: 13, fontWeight: '900', color: '#111827' },
  miniBaslik: { fontSize: 11, color: '#6b7280' },
  miniMeta:   { fontSize: 11, color: '#9ca3af' },

  // Bildir
  bildir:        { backgroundColor: '#fff', borderBottomWidth: 8, borderBottomColor: '#f5f5f5', padding: 16, alignItems: 'center', gap: 10 },
  bildirText:    { fontSize: 13, color: '#6b7280', textAlign: 'center' },
  bildirBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bildirBtnText: { fontSize: 14, fontWeight: '700', color: '#ef4444' },

  // Güvenlik
  guvenlik:      { backgroundColor: '#fff', padding: 16, gap: 8 },
  guvenlikBaslik:{ fontSize: 12, fontWeight: '800', color: '#9ca3af', letterSpacing: 1, marginBottom: 4 },
  guvenlikText:  { fontSize: 13, color: '#6b7280', lineHeight: 20 },

  // Alt bar
  altBar:     { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 24, gap: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0', elevation: 8 },
  whatsappBtn:{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#25d366', justifyContent: 'center', alignItems: 'center' },
  mesajBtn:   { flex: 1, paddingVertical: 14, borderRadius: 25, borderWidth: 1.5, borderColor: '#16a34a', alignItems: 'center' },
  mesajBtnText:{ fontSize: 15, fontWeight: '700', color: '#16a34a' },
  araBtn:     { flex: 1, paddingVertical: 14, borderRadius: 25, backgroundColor: '#16a34a', alignItems: 'center' },
  araBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
